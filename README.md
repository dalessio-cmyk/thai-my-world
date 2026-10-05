# Thai: My World

Personal Thai learning app: https://dalessio-cmyk.github.io/thai-my-world/

## Interactive Teacher

The Teacher tab retains today's spoken recall lesson, nine roleplay situations,
Thai browser speech recognition (`th-TH`), word-match scoring, weak-phrase recycling,
Google Chirp / device voice playback, saved progress, and backup/restore.
These work without Gemini credentials. “Speak now” ends a live session and returns
to the original scored phrase practice; “Hear teacher” uses the original voice
when disconnected.

**Gemini Live** adds two-way microphone conversation, interruptible spoken replies,
input/output transcripts, and lesson-aware Thai tutoring. It receives the selected
mode, current phrase, up to twelve lesson phrases, six weak phrases, and the last
six conversation turns. Changing lesson or roleplay updates the live context.
Live dialogue is not automatically scored against a fixed phrase: use “Speak now”
to record word-match progress. Neither mode claims objective Thai tone grading.

The orb is a decorative visual. **Gemini Live does not provide native talking-avatar
video output in the current documented API.** The former HeyGen integration has
been replaced; no HeyGen account, SDK, avatar ID or key is required.

## Verified API and subscription facts (5 October 2026)

- [Gemini Live overview](https://ai.google.dev/gemini-api/docs/live-api): real-time
  voice/vision input and native PCM audio output, interruption and transcription.
  [Current model](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-live):
  `gemini-3.8-live`; the server setting can change as model availability changes.
- [Google AI Ultra developer benefits](https://blog.google/innovation-and-ai/technology/developers-tools/gdp-premium-ai-pro-ultra/)
  may supply eligible Cloud/API credits after activation. Ultra is not unlimited
  API access, and signing into the consumer Gemini app does not authenticate this app.
- [Gemini API billing](https://ai.google.dev/gemini-api/docs/billing/) is associated
  with a Google Cloud project and billing account in AI Studio. Free-tier access,
  paid model eligibility, quotas and credit applicability must be checked for that
  project. Paid API usage requires its own billing setup; eligible claimed credits
  may offset charges. Google One AI credits and API prepay credits are not interchangeable.
- Use a Gemini Developer API key from [AI Studio](https://aistudio.google.com/api-keys)
  for a project with Generative Language API / Live access. This implementation uses
  the Developer API, not Vertex AI. Existing Cloud TTS service-account credentials
  remain separate and continue to power fallback speech.

## Secure setup

See [backend/README.md](backend/README.md) for deployment and secret setup.
The existing Worker serves both `/tts` and `POST /gemini-live-token`.
GitHub Pages contains no Google credentials. A private teacher access code
(authenticating this personal app's owner) is entered for each connection, sent
only to the chosen HTTPS backend, then cleared from the field. It is never saved
in localStorage, backup files or the service worker.

The Worker authenticates the request and rate-limits it before minting a
single-use token. The Google API key is an encrypted Worker secret. Tokens allow
one connection within 60 seconds and expire after ten minutes. Model, audio-only
output, transcription and teacher instructions are constrained by the server.
The browser connects directly to Google's constrained v1beta WebSocket using
`access_token`, never a permanent API key. Token and response caching is disabled.
See [ephemeral tokens](https://ai.google.dev/gemini-api/docs/live-api/ephemeral-tokens)
and [WebSocket protocol](https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket).

Live sessions stop after nine minutes, on leaving Teacher, hiding the app, a
connection failure, or End live. There is no automatic reconnect or background
microphone. Start again with a fresh access code to continue using saved context.
Mute turns off the microphone track. Interruption stops queued teacher audio.
Headphones are recommended to avoid echo. Modern HTTPS browsers with Web Audio,
AudioWorklet and microphone support are required for live mode.

The last six transcript turns are stored locally, included in backup/restore,
and reused on the next live start. “Clear conversation memory” ends a current
session and clears these turns without deleting lesson progress. Audio is not
saved by this app. Lesson context and live audio are processed by Google under
your project's API data terms. Service worker v7 caches only listed static app
assets, never cross-origin requests or token responses.

## Validation

With Node.js 22 or newer:

```sh
node --test tests/*.test.mjs
```

The tests exercise broker authorization, origin rejection, configuration failures,
rate limiting, payload limits, constrained token creation, redacted provider errors,
client lifecycle cleanup, interruption, and PCM conversion without paid API calls.
For end-to-end live verification, configure Worker secrets and billing, then start
Gemini Live, allow the microphone, speak Thai, interrupt a reply, mute/unmute, and
end the session. Confirm browser microphone access stops and scored fallback still
works. A successful mocked test is not proof of a paid provider connection.
