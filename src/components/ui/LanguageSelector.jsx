import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

const LANGS = [
  { code: "fr", flag: "🇫🇷", label: "FR" },
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "es", flag: "🇪🇸", label: "ES" },
  { code: "it", flag: "🇮🇹", label: "IT" },
];

export default function LanguageSelector({ compact = false }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGS.find((l) => l.code === language) || LANGS[0];

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-btn text-sm text-secondary hover:text-primary hover:bg-dark-cardAlt transition-colors"
      >
        <span>{current.flag}</span>
        {!compact && <span>{current.label}</span>}
        <span className="text-xs">▾</span>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 card p-1 min-w-[140px] animate-scaleIn z-20">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLanguage(l.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-btn text-sm text-left hover:bg-dark-cardAlt transition-colors ${l.code === language ? "text-accent" : "text-primary"}`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
