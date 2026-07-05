# Game Center

A game center web app: register/log in, play ten games, and track your best score against every other registered player.

## Stack

- **Backend**: Python, FastAPI, SQLAlchemy, SQLite. JWT auth (`python-jose`), bcrypt password hashing (`passlib`). Also owns the real game logic for several games: Math Game problems, Wordle, and Hangman are generated and validated server-side (the client never receives the answer), Tic-Tac-Toe's and Connect Four's computer opponents run server-side (Connect Four uses minimax with alpha-beta pruning), and Rock-Paper-Scissors' AI adapts to the player using an order-1 Markov chain over their move history.
- **Frontend**: React + TypeScript, Vite, React Router, Tailwind CSS.

## Games

- **Math Game** — solve arithmetic problems (easy/medium/hard) against a score goal, with a correct-answer streak bonus.
- **Memory Game** — flip cards to find matching pairs; score is based on move count and time.
- **Tic-Tac-Toe** — vs a computer opponent (easy/hard) or a friend on the same computer (hotseat); score depends on winning quickly.
- **Snake** — classic arcade snake; speeds up as it grows. Score = food eaten.
- **2048** — slide and merge tiles. Score = sum of merged tile values.
- **Whack-a-Mole** — 30-second round, moles pop faster over time. Score = moles hit.
- **Wordle** — guess the 5-letter word in 6 tries; fewer guesses means a higher score.
- **Hangman** — guess the hidden word one letter at a time before running out of guesses.
- **Connect Four** — vs a minimax AI (easy/hard) or a friend on the same computer; score depends on winning quickly.
- **Rock-Paper-Scissors** — best of 5 vs an adaptive AI that learns your patterns, or pass-and-play with a friend on the same computer.

Local "vs Friend" matches (Tic-Tac-Toe, Connect Four, Rock-Paper-Scissors) are casual and not submitted to the leaderboard — only vs-computer results count. Every other game reports its result to the backend, which keeps each player's best score per game and a global leaderboard.

## Running locally

You need two terminals — the backend API and the frontend dev server.

### Backend (http://localhost:8000)

```bash
cd backend
python -m venv venv
./venv/Scripts/activate        # venv\Scripts\Activate.ps1 on PowerShell
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

This creates `backend/gamecenter.db` (SQLite) on first run. API docs are at `http://localhost:8000/docs`.

### Frontend (http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`, register an account, and start playing.

## Deploying (e.g. Netlify)

The frontend (`frontend/`) is a static build and deploys fine to Netlify/Vercel/etc. The backend (`backend/`) is a long-running Python process — static hosts **cannot** run it, so it needs a separate host (Fly.io, Railway, Render, or a small VPS all work).

1. Deploy the backend somewhere with HTTPS, note its public URL.
2. In Netlify's dashboard: **Site configuration → Environment variables**, set `VITE_API_BASE_URL` to that backend URL, then trigger a redeploy (env vars only take effect on the next build).
3. Add the deployed frontend's exact origin (e.g. `https://your-site.netlify.app`) to `allow_origins` in `backend/app/main.py` and redeploy the backend — otherwise the browser blocks every API call with a CORS error.
4. `frontend/public/_redirects` (already included) tells Netlify to serve `index.html` for every path — without it, directly opening or refreshing any route other than `/` (e.g. `/login`, or a phone opening a saved link) 404s, since those routes only exist via client-side React Router, not as real files.

## Installing as an app (PWA)

The frontend is a full Progressive Web App (manifest + service worker, via `vite-plugin-pwa`) — no app-store account needed:

```bash
cd frontend
npm run build
npm run preview -- --port 4173
```

Open the preview URL on a phone on the same Wi-Fi network (use your computer's LAN IP instead of `localhost`) and choose "Add to Home Screen" (iOS Safari) or use the install prompt (Android Chrome). It launches full-screen with its own icon, no browser chrome.

**Two things to change before this works off your own machine:**
1. `frontend/src/api/client.ts` hardcodes `API_BASE = "http://localhost:8000"` — a phone can't reach your machine's `localhost`. Point it at your LAN IP (`http://192.168.x.x:8000`) for local testing, or a real deployed backend URL for anything beyond your own network.
2. The backend's CORS `allow_origins` in `backend/app/main.py` must include whatever origin the frontend is actually served from.

For real distribution beyond your own Wi-Fi, the backend needs to be deployed somewhere public with HTTPS (both iOS and Android block plain HTTP from installed apps) — a small VPS or a free/cheap tier on Fly.io/Railway/Render all work.

If you want actual App Store / Play Store listings instead of (or in addition to) the PWA, wrap this same frontend with [Capacitor](https://capacitorjs.com/) — it needs a paid Apple Developer account ($99/year) and a one-time $25 Google Play registration fee, which no tooling can avoid.
