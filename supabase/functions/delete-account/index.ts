import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getAuthTime(accessToken: string) {
  try {
    const encodedPayload = accessToken.split(".")[1];
    if (!encodedPayload) return null;

    const base64Payload = encodedPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=");
    const claims = JSON.parse(atob(base64Payload));
    const authTime = Number(claims.auth_time);

    if (Number.isFinite(authTime)) return authTime;

    const amrTimestamps = Array.isArray(claims.amr)
      ? claims.amr
          .map((method: { timestamp?: unknown }) => Number(method.timestamp))
          .filter((timestamp: number) => Number.isFinite(timestamp))
      : [];

    return amrTimestamps.length ? Math.max(...amrTimestamps) : null;
  } catch {
    return null;
  }
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

  const authorization = request.headers.get("Authorization");
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!accessToken) {
    return jsonResponse(401, { error: "unauthorized" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = getDefaultKey(
    "SUPABASE_ANON_KEY",
    "SUPABASE_PUBLISHABLE_KEYS",
  );
  const serviceRoleKey = getDefaultKey(
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SECRET_KEYS",
  );

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse(500, { error: "server_configuration_error" });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error: userError } = await userClient.auth.getUser(accessToken);

  if (userError || !data.user) {
    return jsonResponse(401, { error: "unauthorized" });
  }

  const authTime = getAuthTime(accessToken);
  const authAgeSeconds =
    authTime !== null ? Date.now() / 1000 - authTime : Infinity;

  if (authAgeSeconds < 0 || authAgeSeconds > 300) {
    console.warn("delete-account: recent authentication check failed", {
      authTime,
      authAgeSeconds: Number.isFinite(authAgeSeconds)
        ? Math.round(authAgeSeconds)
        : null,
    });
    return jsonResponse(403, { error: "recent_authentication_required" });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(
    data.user.id,
  );

  if (deleteError) {
    return jsonResponse(500, { error: "account_deletion_failed" });
  }

  return jsonResponse(200, { success: true });
});
