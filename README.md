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
