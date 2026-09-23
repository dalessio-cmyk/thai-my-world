# Thai: My World neural voice backend

This Worker keeps the Google Cloud Text-to-Speech credential off the public GitHub Pages app.

## Provider
Google Cloud Text-to-Speech, Thai (Thailand), Chirp 3 HD.

Supported app voices:
- th-TH-Chirp3-HD-Achird
- th-TH-Chirp3-HD-Charon
- th-TH-Chirp3-HD-Aoede
- th-TH-Chirp3-HD-Kore

## Cloudflare Worker setup
1. Create a Cloudflare account and a Worker named `thai-my-world-voice`.
2. Paste `cloudflare-worker.js` into the Worker, or deploy this directory with Wrangler.
3. In Google Cloud, enable Cloud Text-to-Speech and create an API key restricted to the Text-to-Speech API.
4. In the Worker settings, add an encrypted secret named `GOOGLE_TTS_API_KEY`.
5. Deploy.
6. Copy the Worker URL, such as `https://thai-my-world-voice.<your-subdomain>.workers.dev`.
7. In Thai: My World, open Today's lesson > Voice playback, paste that URL into Neural voice backend, and select Neural Thai.

The Google API key never belongs in index.html, app.js, GitHub Pages, or localStorage.
