# Thai: My World neural voice backend

This Worker keeps Google Cloud credentials off the public GitHub Pages app.

## Provider
Google Cloud Text-to-Speech, Thai (Thailand), Chirp 3 HD.

Supported app voices:
- th-TH-Chirp3-HD-Achird
- th-TH-Chirp3-HD-Charon
- th-TH-Chirp3-HD-Aoede
- th-TH-Chirp3-HD-Kore

## Authentication
Cloud Text-to-Speech synthesis uses OAuth. This Worker uses a Google Cloud service account JSON credential stored only as an encrypted Cloudflare Worker secret. It exchanges a signed JWT for a short-lived OAuth access token and never exposes the service-account credential to the browser.

## Google Cloud setup
1. Enable Cloud Text-to-Speech in the Thai My World project.
2. Create a dedicated service account named `thai-my-world-voice`.
3. Give it only the project access required to consume the enabled API. Start with **Service Usage Consumer** rather than Owner/Editor.
4. Create one JSON key for that service account.
5. Treat that JSON file as a secret. Do not upload it to GitHub or paste it into ChatGPT.

Google recommends workload identity federation for external-cloud production workloads. For this small personal app, a narrowly scoped service-account key stored as an encrypted Worker secret is the simpler deployment. Rotate or delete the key if the Worker is retired.

## Cloudflare Worker setup
1. Use the Worker named `thai-my-world`.
2. Paste `cloudflare-worker.js` into the Worker, or deploy this directory with Wrangler.
3. In Worker Settings > Variables and Secrets, add an encrypted secret named:
   `GOOGLE_SERVICE_ACCOUNT_JSON`
4. Paste the entire contents of the downloaded Google service-account JSON file as the secret value.
5. Deploy the Worker.
6. The production URL is `https://thai-my-world.dalessioinc.workers.dev`.
7. Thai: My World uses that URL by default. No manual setup is needed in the app. The backend field remains available for an optional override; clearing it restores the production default.

The Google service-account JSON must never be stored in index.html, app.js, GitHub Pages, localStorage, or any public repository.

## Gemini Live teacher (October 2026)

The main Worker now imports `gemini-live.js`. Deploy **both** files using Wrangler;
pasting only `cloudflare-worker.js` is no longer sufficient. The `/tts` route and
its `GOOGLE_SERVICE_ACCOUNT_JSON` secret retain their existing behavior.

1. In Google AI Studio, choose your personal app project (for example DAlessio),
   check its Live API eligibility and billing balance, and copy its Gemini API key.
   Do not use an unrelated client's project. Enable the Generative Language API
   if required. Claim Ultra developer benefits separately and verify applicable
   credits in that project's billing view; do not assume unlimited API usage.
2. Copy `wrangler.toml.example` to `wrangler.toml`. The production Worker name is
   `thai-my-world`. Keep `APP_ORIGIN` equal to your exact Pages origin. Keep the
   rate-limit binding; its namespace ID must be unique to this app in your account.
3. Use Wrangler 4.36+ with your Cloudflare account. From this directory:

   ```sh
   npx wrangler login
   npx wrangler secret put GEMINI_API_KEY
   npx wrangler secret put TEACHER_ACCESS_CODE
   npx wrangler deploy
   ```

   Enter the Gemini key only at the secret prompt. For `TEACHER_ACCESS_CODE`, use a
   unique password-manager-generated random string of at least 32 characters.
   Save this private code in your password manager. It is not the Google API key.
   Alternatively, set these two encrypted secrets in the existing Worker's
   Settings > Variables and Secrets. Wrangler still deploys the modules/binding.
   Preserve the existing `GOOGLE_SERVICE_ACCOUNT_JSON` secret.
4. In Teacher > Gemini setup, keep the production backend URL, enter the private
   teacher access code, and select Start Gemini Live. Allow microphone access.
   The code field clears after requesting a connection; enter it again to reconnect.

`GEMINI_LIVE_MODEL` defaults to `gemini-3.8-live` per current Google documentation;
change it server-side if your project has access to another compatible Live model.
No model or system-instruction overrides are accepted from the browser.

### Security and operational behavior

- Origin checks alone are not authentication. A constant-time comparison of
  SHA-256 digests verifies the private bearer code. Missing key, weak/missing code,
  or absent rate limiter fails closed with 503. No provider call happens on 401/403.
- The rate limiter permits five session requests per IP per minute at a Cloudflare
  location. It is abuse throttling, not a global spending cap. This shared-code
  design is for a personal app; use individual authenticated identities for a
  multi-user service. Rotate the access code if disclosed.
- The broker accepts no learner data and caps request bodies at 1 KB. It uses a
  15-second upstream timeout, sanitized provider errors, and `Cache-Control: no-store`
  on every response. Do not log Authorization headers, API keys or token bodies.
- Tokens are single-use, constrained to the server-selected model and teacher
  configuration, usable for new sessions for 60 seconds, and expire in ten minutes.
  The app ends at nine minutes. It does not implement session resumption; it starts
  fresh sessions with bounded saved context instead.
- Do not commit `.dev.vars`, `.env`, API keys, service-account JSON, or access codes.
  Budget alerts and provider quotas should be configured in your own billing account.
- 401: incorrect code; 403: wrong origin; 429: retry after a minute / check provider
  quota; 503: incomplete Worker setup; 502: inspect API/model/billing configuration.
  The app keeps the original voice teacher available in every case.

Protocol references: [Google ephemeral tokens](https://ai.google.dev/gemini-api/docs/live-api/ephemeral-tokens),
[WebSocket guide](https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket),
[Cloudflare rate limits](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).
