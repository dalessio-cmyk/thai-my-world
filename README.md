# thai-my-world
My personal Thai learning app.

## Interactive Teacher

The **Teacher** tab now supports:
- Today's lesson as spoken recall
- Roleplay across film production, VFX/post, business, accounting, repairs, travel, cooking, and daily life
- Browser Thai speech recognition (`th-TH`) with immediate word-match scoring
- Weak-phrase recycling from prior Teacher attempts
- Google Chirp / device Thai voice playback
- Optional HeyGen LiveAvatar video sessions
- Teacher progress included in the existing backup/restore file

### LiveAvatar server setup

GitHub Pages must never contain a permanent HeyGen API key. The app requests a short-lived session token from a secure backend at:

`POST /liveavatar-token`

A Cloudflare Worker implementation is included in `liveavatar-token-worker.js`.

Required Worker secrets:
- `HEYGEN_API_KEY`
- `HEYGEN_AVATAR_ID`

Optional:
- `HEYGEN_SANDBOX=true`
- `APP_ORIGIN=https://dalessio-cmyk.github.io`

The Teacher setup panel also accepts a temporary LiveAvatar session token for testing without storing a permanent API key in the browser.

### Pronunciation scoring

Current Teacher scoring measures how closely Thai browser speech recognition matches the target words. It does not claim to grade tones. Azure Speech pronunciation assessment can be added server-side for deeper Thai pronunciation scoring.
