import { useEffect, useRef, useState } from "react";
import PageTitle from "../components/ui/PageTitle";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../lib/supabase";

function ChatIcon({ type }) {
  if (type === "send") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
        <path d="m21 3-7.2 18-3.9-7.9L2 9.2 21 3Z" />
        <path d="M9.9 13.1 21 3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5" aria-hidden="true">
      <path d="M12 3a7 7 0 0 0-4.3 12.5c.8.6 1.3 1.5 1.3 2.5h6c0-1 .5-1.9 1.3-2.5A7 7 0 0 0 12 3Z" />
      <path d="M9.5 21h5M10 18h4M12 6v2m-4.2-.2 1.4 1.4m7.6-1.4-1.4 1.4" />
    </svg>
  );
}

function getResponseText(data) {
  if (data === "[DONE]") return "";
  try {
    const parsed = JSON.parse(data);
    return typeof parsed.response === "string" ? parsed.response : "";
  } catch {
    return "";
  }
}

export default function Assistant() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [quotaReached, setQuotaReached] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  useEffect(() => {
    if (!quotaReached) return undefined;

    const now = new Date();
    const nextUtcDay = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
    );
    const timeoutId = window.setTimeout(() => {
      setQuotaReached(false);
      setError("");
    }, nextUtcDay - now.getTime());

    return () => window.clearTimeout(timeoutId);
  }, [quotaReached]);

  const sendMessage = async (messageValue = draft) => {
    const message = messageValue.trim();
    if (!message || isSending || quotaReached) return;

    setDraft("");
    setError("");
    setIsSending(true);
    const priorMessages = messages.slice(-8).map(({ role, content }) => ({ role, content }));
    const assistantIndex = messages.length + 1;
    setMessages((current) => [
      ...current,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("unauthorized");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/forge-assistant`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: anonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, history: priorMessages, language }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "assistant_unavailable");
      }
      if (!response.body) throw new Error("assistant_unavailable");
      const quotaHeader = response.headers.get(
        "X-Assistant-Questions-Remaining",
      );
      const questionsRemaining = quotaHeader === null ? null : Number(quotaHeader);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let answer = "";

      const processEvent = (event) => {
        const data = event
          .split(/\r?\n/)
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trim())
          .join("\n");
        if (!data) return;
        const token = getResponseText(data);
        if (!token) return;
        answer += token;
        setMessages((current) => current.map((item, index) =>
          index === assistantIndex ? { ...item, content: answer } : item,
        ));
      };

      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() || "";
        events.forEach(processEvent);
        if (done) break;
      }
      if (buffer.trim()) processEvent(buffer);
      if (!answer.trim()) throw new Error("empty_response");
      if (questionsRemaining === 0) {
        setQuotaReached(true);
        setError(t("assistant.dailyQuotaReached"));
      }
    } catch (sendError) {
      setMessages((current) => current.filter((_, index) => index !== assistantIndex));
      if (sendError.message === "daily_quota_reached") {
        setQuotaReached(true);
        setError(t("assistant.dailyQuotaReached"));
      } else {
        setError(t("assistant.error"));
      }
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="animate-fadeIn mx-auto flex min-h-[calc(100dvh-11rem)] max-w-4xl flex-col pb-4">
      <header className="mb-6">
        <PageTitle icon="/ForgeIcons/Brain.png" className="mb-2">
          {t("assistant.title")}
        </PageTitle>
        <p className="text-secondary">{t("assistant.subtitle")}</p>
      </header>

      <section className="card relative flex min-h-[460px] flex-1 flex-col overflow-hidden border border-app">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent/8 blur-3xl" />
        <div className="relative flex items-center gap-3 border-b border-app px-4 py-3 sm:px-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
            <ChatIcon type="spark" />
          </span>
          <div>
            <p className="font-semibold text-primary">Forge AI</p>
            <p className="text-xs text-secondary">{t("assistant.subtitle")}</p>
          </div>
          <span className="ml-auto flex items-center gap-2 text-xs text-secondary">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            {t("assistant.ready")}
          </span>
        </div>

        <div className="relative flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6" role="log" aria-live="polite" aria-relevant="additions text">
          {messages.length === 0 ? (
            <div className="mx-auto flex min-h-[300px] max-w-xl flex-col items-center justify-center text-center">
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
                <ChatIcon type="spark" />
              </span>
              <h2 className="text-xl font-bold text-primary">{t("assistant.welcomeTitle")}</h2>
              <p className="mt-2 text-sm text-secondary">{t("assistant.welcomeText")}</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={`${index}-${message.role}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[78%] ${message.role === "user" ? "rounded-br-md bg-accent/15 text-primary" : "rounded-bl-md border border-app bg-app/70 text-primary"}`}>
                  {message.content || (isSending && index === messages.length - 1 ? <span className="inline-flex items-center gap-2 text-secondary"><span className="h-2 w-2 animate-pulse rounded-full bg-accent" />{t("assistant.sending")}</span> : null)}
                </div>
              </div>
            ))
          )}
          {error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">{error}</p>}
          <div ref={bottomRef} />
        </div>

        <form
          className="relative border-t border-app p-3 sm:p-4"
          onSubmit={(event) => { event.preventDefault(); sendMessage(); }}
        >
          <p className="mb-2 px-1 text-xs text-secondary">{t("assistant.faqOnly")}</p>
          <div
            role="group"
            aria-label={t("assistant.faqLabel")}
            className="mb-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
          >
            {t("assistant.suggestions").map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => sendMessage(suggestion)}
                disabled={isSending || quotaReached}
                className="shrink-0 rounded-full border border-app bg-app/70 px-3 py-2 text-left text-xs text-secondary transition-colors hover:border-accent/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <label htmlFor="assistant-prompt" className="sr-only">{t("assistant.placeholder")}</label>
          <div className="flex items-end gap-2 rounded-2xl border border-app bg-app p-2 focus-within:border-accent/40">
            <textarea
              ref={inputRef}
              id="assistant-prompt"
              rows={1}
              maxLength={1000}
              value={draft}
              disabled={quotaReached}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={quotaReached ? t("assistant.dailyQuotaPlaceholder") : t("assistant.placeholder")}
              className="max-h-32 min-h-10 flex-1 resize-y bg-transparent px-2 py-2 text-sm text-primary outline-none placeholder:text-secondary/70"
            />
            <button
              type="submit"
              disabled={!draft.trim() || isSending || quotaReached}
              aria-label={t("assistant.send")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-black transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChatIcon type="send" />
            </button>
          </div>
          <p className="mt-2 px-1 text-[11px] leading-relaxed text-secondary">{t("assistant.disclaimer")}</p>
        </form>
      </section>
    </div>
  );
}
