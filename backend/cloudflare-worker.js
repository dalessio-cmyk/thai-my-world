const ALLOWED_ORIGINS = new Set([
  "https://dalessio-cmyk.github.io"
]);

const ALLOWED_VOICES = new Set([
  "th-TH-Chirp3-HD-Achird",
  "th-TH-Chirp3-HD-Charon",
  "th-TH-Chirp3-HD-Aoede",
  "th-TH-Chirp3-HD-Kore"
]);

let tokenCache = { accessToken: "", expiresAt: 0 };

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://dalessio-cmyk.github.io",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function stringToBase64Url(value) {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function pemToArrayBuffer(pem) {
  const body = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s+/g, "");
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function serviceAccountAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);

  if (tokenCache.accessToken && tokenCache.expiresAt > now + 120) {
    return tokenCache.accessToken;
  }

  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  };

  const unsigned =
    stringToBase64Url(JSON.stringify(header)) +
    "." +
    stringToBase64Url(JSON.stringify(claim));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(serviceAccount.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned)
  );

  const assertion = unsigned + "." + bytesToBase64Url(new Uint8Array(signature));

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });

  if (!tokenResponse.ok) {
    throw new Error("Google OAuth token exchange failed");
  }

  const data = await tokenResponse.json();
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + Number(data.expires_in || 3600)
  };
  return tokenCache.accessToken;
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

    if (!env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      return new Response("Voice service is not configured", {
        status: 503,
        headers: cors(origin)
      });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400, headers: cors(origin) });
    }

    const text = String(payload.text || "").trim();
    const voice = ALLOWED_VOICES.has(payload.voice)
      ? payload.voice
      : "th-TH-Chirp3-HD-Achird";
    const mode = payload.mode === "natural" ? "natural" : "learn";

    if (!text || text.length > 500) {
      return new Response("Text must be between 1 and 500 characters", {
        status: 400,
        headers: cors(origin)
      });
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON);
      if (!serviceAccount.client_email || !serviceAccount.private_key || !serviceAccount.project_id) {
        throw new Error("Incomplete service account JSON");
      }
    } catch {
      return new Response("Invalid Google service account configuration", {
        status: 503,
        headers: cors(origin)
      });
    }

    let accessToken;
    try {
      accessToken = await serviceAccountAccessToken(serviceAccount);
    } catch {
      return new Response("Google authentication failed", {
        status: 502,
        headers: cors(origin)
      });
    }

    const googleResponse = await fetch(
      "https://texttospeech.googleapis.com/v1/text:synthesize",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + accessToken,
          "x-goog-user-project": serviceAccount.project_id,
          "Content-Type": "application/json; charset=utf-8"
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
      }
    );

    if (!googleResponse.ok) {
      const detail = await googleResponse.text();
      return new Response("TTS provider error: " + detail.slice(0, 500), {
        status: 502,
        headers: cors(origin)
      });
    }

    const data = await googleResponse.json();
    if (!data.audioContent) {
      return new Response("No audio returned", {
        status: 502,
        headers: cors(origin)
      });
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
