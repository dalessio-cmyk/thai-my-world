const ALLOWED_ORIGINS = new Set([
  "https://dalessio-cmyk.github.io"
]);

const ALLOWED_VOICES = new Set([
  "th-TH-Chirp3-HD-Achird",
  "th-TH-Chirp3-HD-Charon",
  "th-TH-Chirp3-HD-Aoede",
  "th-TH-Chirp3-HD-Kore"
]);

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://dalessio-cmyk.github.io",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function decodeBase64(base64) {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    if (url.pathname !== "/tts" || request.method !== "POST") {
      return new Response("Not found", { status: 404 });
    }

    if (!ALLOWED_ORIGINS.has(origin)) {
      return new Response("Origin not allowed", { status: 403 });
    }

    if (!env.GOOGLE_TTS_API_KEY) {
      return new Response("Voice service is not configured", { status: 503, headers: cors(origin) });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400, headers: cors(origin) });
    }

    const text = String(payload.text || "").trim();
    const voice = ALLOWED_VOICES.has(payload.voice) ? payload.voice : "th-TH-Chirp3-HD-Achird";
    const mode = payload.mode === "natural" ? "natural" : "learn";

    if (!text || text.length > 500) {
      return new Response("Text must be between 1 and 500 characters", { status: 400, headers: cors(origin) });
    }

    const googleResponse = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "x-goog-api-key": env.GOOGLE_TTS_API_KEY
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: "th-TH",
          name: voice
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: mode === "learn" ? 0.72 : 1.0
        }
      })
    });

    if (!googleResponse.ok) {
      const detail = await googleResponse.text();
      return new Response("TTS provider error: " + detail.slice(0, 500), {
        status: 502,
        headers: cors(origin)
      });
    }

    const data = await googleResponse.json();
    if (!data.audioContent) {
      return new Response("No audio returned", { status: 502, headers: cors(origin) });
    }

    return new Response(decodeBase64(data.audioContent), {
      status: 200,
      headers: {
        ...cors(origin),
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=86400"
      }
    });
  }
};
