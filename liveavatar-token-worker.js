// Cloudflare Worker endpoint for Thai: My World LiveAvatar sessions.
// Deploy this as a separate Worker or merge the /liveavatar-token route
// into the existing neural-voice Worker.
//
// Required secrets:
//   HEYGEN_API_KEY
//   HEYGEN_AVATAR_ID
// Optional:
//   HEYGEN_SANDBOX = "true" | "false"
//   APP_ORIGIN = "https://dalessio-cmyk.github.io"

function corsHeaders(request, env) {
  const allowed = env.APP_ORIGIN || "https://dalessio-cmyk.github.io";
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = origin === allowed || origin.startsWith("http://localhost") ? origin : allowed;
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
    "Cache-Control": "no-store"
  };
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(request, env);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/liveavatar-token" || request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    if (!env.HEYGEN_API_KEY || !env.HEYGEN_AVATAR_ID) {
      return new Response(JSON.stringify({
        error: "LiveAvatar is not configured. Add HEYGEN_API_KEY and HEYGEN_AVATAR_ID as Worker secrets."
      }), {
        status: 503,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    let body = {};
    try { body = await request.json(); } catch (_) {}
    const mode = body.mode === "LITE" ? "LITE" : "FULL";

    const upstream = await fetch("https://api.liveavatar.com/v1/sessions/token", {
      method: "POST",
      headers: {
        "X-API-KEY": env.HEYGEN_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mode,
        avatar_id: env.HEYGEN_AVATAR_ID,
        is_sandbox: String(env.HEYGEN_SANDBOX || "").toLowerCase() === "true"
      })
    });

    let payload = {};
    try { payload = await upstream.json(); } catch (_) {}

    if (!upstream.ok) {
      const message = payload?.data?.[0]?.message || payload?.error || "LiveAvatar session token request failed.";
      return new Response(JSON.stringify({ error: message }), {
        status: upstream.status,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    const data = payload.data || {};
    return new Response(JSON.stringify({
      session_token: data.session_token,
      session_id: data.session_id,
      mode
    }), {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" }
    });
  }
};
