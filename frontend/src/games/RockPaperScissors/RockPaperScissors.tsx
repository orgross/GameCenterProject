import { useState } from "react";
import { Link } from "react-router-dom";
import { newRpsGame, playRps, type Move } from "../../api/rps";
import { submitScore } from "../../api/scores";

type Mode = "computer" | "friend";
type Stage = "settings" | "playing";
type FriendPhase = "p1_pick" | "cover" | "p2_pick" | "reveal" | "match_over";

const MOVES: Move[] = ["rock", "paper", "scissors"];
const MOVE_EMOJI: Record<Move, string> = { rock: "🪨", paper: "📄", scissors: "✂️" };
const BEATS: Record<Move, Move> = { rock: "scissors", paper: "rock", scissors: "paper" };
const WINS_NEEDED = 3;

function compare(a: Move, b: Move): "p1" | "p2" | "draw" {
  if (a === b) return "draw";
  return BEATS[a] === b ? "p1" : "p2";
}

export function RockPaperScissors() {
  const [stage, setStage] = useState<Stage>("settings");
  const [mode, setMode] = useState<Mode>("computer");

  // vs Computer state
  const [gameId, setGameId] = useState<string | null>(null);
  const [humanWins, setHumanWins] = useState(0);
  const [aiWins, setAiWins] = useState(0);
  const [lastRound, setLastRound] = useState<{ human: Move; ai: Move; result: string } | null>(null);
  const [matchOver, setMatchOver] = useState(false);
  const [matchWinner, setMatchWinner] = useState<"human" | "ai" | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);

  // vs Friend state
  const [friendPhase, setFriendPhase] = useState<FriendPhase>("p1_pick");
  const [p1Move, setP1Move] = useState<Move | null>(null);
  const [p2Move, setP2Move] = useState<Move | null>(null);
  const [p1Wins, setP1Wins] = useState(0);
  const [p2Wins, setP2Wins] = useState(0);

  const startGame = async () => {
    if (mode === "computer") {
      const game = await newRpsGame();
      setGameId(game.game_id);
      setHumanWins(0);
      setAiWins(0);
      setLastRound(null);
      setMatchOver(false);
      setMatchWinner(null);
      setBestScore(null);
    } else {
      setFriendPhase("p1_pick");
      setP1Move(null);
      setP2Move(null);
      setP1Wins(0);
      setP2Wins(0);
    }
    setStage("playing");
  };

  const handleComputerMove = async (move: Move) => {
    if (!gameId || matchOver) return;
    const response = await playRps(gameId, move);
    setHumanWins(response.human_wins);
    setAiWins(response.ai_wins);
    setLastRound({
      human: response.human_move,
      ai: response.ai_move,
      result:
        response.result === "human_win" ? "You win this round!" : response.result === "ai_win" ? "Computer wins this round!" : "Draw!",
    });

    if (response.match_over) {
      setMatchOver(true);
      setMatchWinner(response.match_winner);
      try {
        const result = await submitScore("rock_paper_scissors", response.human_wins * 20);
        setBestScore(result.best_score);
      } catch {
        // Not fatal if the score can't be saved.
      }
    }
  };

  const handleP1Pick = (move: Move) => {
    setP1Move(move);
    setFriendPhase("cover");
  };

  const handleP2Pick = (move: Move) => {
    setP2Move(move);
    setFriendPhase("reveal");

    const winner = compare(p1Move as Move, move);
    if (winner === "p1") setP1Wins((w) => w + 1);
    if (winner === "p2") setP2Wins((w) => w + 1);
  };

  const nextFriendRound = () => {
    if (p1Wins >= WINS_NEEDED || p2Wins >= WINS_NEEDED) {
      setFriendPhase("match_over");
      return;
    }
    setP1Move(null);
    setP2Move(null);
    setFriendPhase("p1_pick");
  };

  if (stage === "settings") {
    return (
      <div className="flex justify-center items-center px-4 py-20">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">✊ Rock-Paper-Scissors</h1>

          <label className="block text-sm mb-1 text-white/70">Mode</label>
          <select
            className="w-full mb-6 rounded-md bg-black/30 border border-white/10 px-3 py-2"
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
          >
            <option value="computer">vs Computer (adaptive AI)</option>
            <option value="friend">vs Friend (pass and play)</option>
          </select>

          <button
            onClick={startGame}
            className="w-full rounded-md bg-violet-600 py-2 font-medium hover:bg-violet-500 transition-colors"
          >
            Start
          </button>
          <Link to="/" className="block text-center text-sm text-white/50 mt-4 hover:text-white/80">
            ← Back to games
          </Link>
        </div>
      </div>
    );
  }

  if (mode === "computer") {
    return (
      <div className="flex flex-col items-center px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">✊ Rock-Paper-Scissors</h1>
        <p className="text-white/70 mb-6">
          You: {humanWins} — Computer: {aiWins} (first to {WINS_NEEDED})
        </p>

        {lastRound && (
          <div className="flex items-center gap-8 mb-6 text-5xl">
            <span>{MOVE_EMOJI[lastRound.human]}</span>
            <span className="text-xl text-white/50">vs</span>
            <span>{MOVE_EMOJI[lastRound.ai]}</span>
          </div>
        )}
        {lastRound && <p className="mb-6 text-white/80">{lastRound.result}</p>}

        {!matchOver && (
          <div className="flex gap-4 mb-8">
            {MOVES.map((move) => (
              <button
                key={move}
                onClick={() => handleComputerMove(move)}
                className="w-20 h-20 rounded-2xl bg-white/10 hover:bg-white/20 text-4xl flex items-center justify-center transition-colors"
              >
                {MOVE_EMOJI[move]}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={startGame}
            className="rounded-md bg-violet-600 px-4 py-2 font-medium hover:bg-violet-500 transition-colors"
          >
            New Match
          </button>
          <Link to="/" className="rounded-md bg-white/10 px-4 py-2 font-medium hover:bg-white/20 transition-colors">
            ← Back
          </Link>
        </div>

        {matchOver && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center max-w-sm">
            <h2 className="text-xl font-bold mb-2">{matchWinner === "human" ? "🎉 You won the match!" : "💻 Computer won the match!"}</h2>
            <p className="text-white/70 mb-1">Score: {humanWins * 20}</p>
            {bestScore !== null && <p className="text-violet-300">Your best on this game: {bestScore}</p>}
          </div>
        )}
      </div>
    );
  }

  // vs Friend (pass and play)
  return (
    <div className="flex flex-col items-center px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">✊ Rock-Paper-Scissors</h1>
      <p className="text-white/70 mb-8">
        Player 1: {p1Wins} — Player 2: {p2Wins} (first to {WINS_NEEDED})
      </p>

      {friendPhase === "p1_pick" && (
        <>
          <p className="mb-4 text-lg font-medium">Player 1, choose your move</p>
          <div className="flex gap-4">
            {MOVES.map((move) => (
              <button
                key={move}
                onClick={() => handleP1Pick(move)}
                className="w-20 h-20 rounded-2xl bg-white/10 hover:bg-white/20 text-4xl flex items-center justify-center transition-colors"
              >
                {MOVE_EMOJI[move]}
              </button>
            ))}
          </div>
        </>
      )}

      {friendPhase === "cover" && (
        <div className="text-center">
          <p className="mb-2 text-lg">🙈 Player 1's move is locked in.</p>
          <p className="mb-6 text-white/60">Pass the device to Player 2.</p>
          <button
            onClick={() => setFriendPhase("p2_pick")}
            className="rounded-md bg-violet-600 px-6 py-2 font-medium hover:bg-violet-500 transition-colors"
          >
            I'm Player 2 — Reveal my choices
          </button>
        </div>
      )}

      {friendPhase === "p2_pick" && (
        <>
          <p className="mb-4 text-lg font-medium">Player 2, choose your move</p>
          <div className="flex gap-4">
            {MOVES.map((move) => (
              <button
                key={move}
                onClick={() => handleP2Pick(move)}
                className="w-20 h-20 rounded-2xl bg-white/10 hover:bg-white/20 text-4xl flex items-center justify-center transition-colors"
              >
                {MOVE_EMOJI[move]}
              </button>
            ))}
          </div>
        </>
      )}

      {friendPhase === "reveal" && p1Move && p2Move && (
        <div className="text-center">
          <div className="flex items-center gap-8 mb-4 text-5xl justify-center">
            <span>{MOVE_EMOJI[p1Move]}</span>
            <span className="text-xl text-white/50">vs</span>
            <span>{MOVE_EMOJI[p2Move]}</span>
          </div>
          <p className="mb-6 text-lg font-medium">
            {compare(p1Move, p2Move) === "draw"
              ? "Draw!"
              : compare(p1Move, p2Move) === "p1"
              ? "Player 1 wins this round!"
              : "Player 2 wins this round!"}
          </p>
          <button
            onClick={nextFriendRound}
            className="rounded-md bg-violet-600 px-6 py-2 font-medium hover:bg-violet-500 transition-colors"
          >
            Next round
          </button>
        </div>
      )}

      {friendPhase === "match_over" && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center max-w-sm">
          <h2 className="text-xl font-bold mb-2">
            {p1Wins > p2Wins ? "🎉 Player 1 wins the match!" : "🎉 Player 2 wins the match!"}
          </h2>
          <p className="text-white/70">Local match — not saved to the leaderboard.</p>
        </div>
      )}

      <div className="flex gap-3 mt-8">
        <button
          onClick={startGame}
          className="rounded-md bg-violet-600 px-4 py-2 font-medium hover:bg-violet-500 transition-colors"
        >
          New Match
        </button>
        <Link to="/" className="rounded-md bg-white/10 px-4 py-2 font-medium hover:bg-white/20 transition-colors">
          ← Back
        </Link>
      </div>
    </div>
  );
}
