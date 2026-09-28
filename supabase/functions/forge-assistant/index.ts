import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

const languageNames: Record<string, string> = {
  fr: "French",
  en: "English",
  es: "Spanish",
  it: "Italian",
};

function jsonResponse(status: number, body: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getDefaultKey(legacyVariable: string, keySetVariable: string) {
  const legacyKey = Deno.env.get(legacyVariable);
  if (legacyKey) return legacyKey;

  try {
    const keySet = JSON.parse(Deno.env.get(keySetVariable) ?? "{}");
    return keySet.default ?? null;
  } catch {
    return null;
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse(405, { error: "method_not_allowed" });
  }

  const accessToken = request.headers.get("Authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!accessToken) return jsonResponse(401, { error: "unauthorized" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publishableKey = getDefaultKey("SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEYS");
  if (!supabaseUrl || !publishableKey) {
    return jsonResponse(500, { error: "server_configuration_error" });
  }

  const userClient = createClient(supabaseUrl, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: authError } = await userClient.auth.getUser(accessToken);
  if (authError || !user) return jsonResponse(401, { error: "unauthorized" });

  const cloudflareAccountId = Deno.env.get("CLOUDFLARE_ACCOUNT_ID");
  const cloudflareAiToken = Deno.env.get("CLOUDFLARE_AI_TOKEN");
  if (!cloudflareAccountId || !cloudflareAiToken) {
    return jsonResponse(503, { error: "ai_not_configured" });
  }

  let payload: { message?: unknown; history?: unknown; language?: unknown };
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(400, { error: "invalid_request" });
  }

  if (typeof payload.message !== "string" || !payload.message.trim() || payload.message.length > 1000) {
    return jsonResponse(400, { error: "invalid_message" });
  }

  const language = typeof payload.language === "string" && languageNames[payload.language]
    ? payload.language
    : "fr";
  const history = Array.isArray(payload.history)
    ? payload.history
        .filter((item): item is { role: string; content: string } =>
          Boolean(item) && typeof item === "object" &&
          ((item as { role?: unknown }).role === "user" || (item as { role?: unknown }).role === "assistant") &&
          typeof (item as { content?: unknown }).content === "string",
        )
        .slice(-8)
        .map((item) => ({ role: item.role, content: item.content.slice(0, 1000) }))
    : [];

  const systemPrompt = `You are the help assistant for the Forge Your Body app. Answer in ${languageNames[language]}.

Treat the following product facts as the complete and authoritative description of the app. Do not infer, promise, or invent other features:
- Dashboard: shows workout statistics and a way to start a workout.
- Workout: lets the user record a workout, add exercises, record sets with weights and repetitions, and finish the session.
- My exercises: lets the user manage their exercise library.
- History: lists completed workouts and lets the user view a workout's details.
- Progress: shows workout/volume statistics, exercise weight progress, and personal records. It can delete completed workouts from before last week while retaining last week's and this week's workouts.
- Goals: provides example seven-day meal plans for muscle gain and cutting. These are examples, not personalized nutrition plans.
- Cycle: lets eligible users record menstrual-cycle dates and see estimates. It is shown only when cycle tracking is enabled for the profile.
- Profile: lets the user manage profile details and their avatar.
- Settings: includes app preferences and account actions.
- The app supports French, English, Spanish, and Italian, plus light and dark themes.

The app does NOT provide meal or calorie tracking, energy-needs calculations, custom workout-plan generation, medication or supplement management, sleep or stress tracking, or daily-habit evaluation. If asked about a feature not listed above, say clearly that you cannot confirm it is available in Forge Your Body. Never describe generic fitness-app features as Forge features. Do not claim access to the user's account, private data, or current app state.

For medical questions, or requests for personalized nutrition or training prescriptions, explain that the app assistant cannot provide professional advice and suggest consulting a qualified professional. For unrelated questions, briefly say you can only help with Forge Your Body.

Keep answers concise: normally one to four short sentences. Use plain text only: no Markdown markers, headings, or long feature catalogs unless the user explicitly asks for a summary. Be factual and friendly.`;

  const cloudflareResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/run/@cf/meta/llama-3.2-1b-instruct`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cloudflareAiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: payload.message.trim() },
        ],
        max_tokens: 220,
        temperature: 0.1,
        stream: true,
      }),
    },
  );

  if (!cloudflareResponse.ok || !cloudflareResponse.body) {
    console.error("forge-assistant: model request failed", cloudflareResponse.status);
    return jsonResponse(502, { error: "assistant_unavailable" });
  }

  return new Response(cloudflareResponse.body, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream; charset=utf-8",
      "X-Accel-Buffering": "no",
    },
  });
});
