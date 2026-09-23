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
1. Create a Worker named `thai-my-world-voice`.
2. Paste `cloudflare-worker.js` into the Worker, or deploy this directory with Wrangler.
3. In Worker Settings > Variables and Secrets, add an encrypted secret named:
   `GOOGLE_SERVICE_ACCOUNT_JSON`
4. Paste the entire contents of the downloaded Google service-account JSON file as the secret value.
5. Deploy the Worker.
6. Copy its `.workers.dev` URL.
7. In Thai: My World, paste that URL into Neural voice backend.

The Google service-account JSON must never be stored in index.html, app.js, GitHub Pages, localStorage, or any public repository.
