import { useState } from "react";
import { Link } from "react-router-dom";
import { newRpsGame, playRps, type Move } from "../../api/rps";
import { submitScore } from "../../api/scores";
import { useLanguage } from "../../context/LanguageContext";

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
  const { t } = useLanguage();
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
        response.result === "human_win"
          ? t("rps.youWinRound")
          : response.result === "ai_win"
          ? t("rps.computerWinsRound")
          : t("rps.drawRound"),
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
          <h1 className="text-2xl font-bold mb-6 text-center">{t("rps.title")}</h1>

          <label className="block text-sm mb-1 text-white/70">{t("rps.mode")}</label>
          <select
            className="w-full mb-6 rounded-md bg-black/30 border border-white/10 px-3 py-2"
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
          >
            <option value="computer">{t("rps.vsComputer")}</option>
            <option value="friend">{t("rps.vsFriend")}</option>
          </select>

          <button
            onClick={startGame}
            className="w-full rounded-md bg-violet-600 py-2 font-medium hover:bg-violet-500 transition-colors"
          >
            {t("common.start")}
          </button>
          <Link to="/" className="block text-center text-sm text-white/50 mt-4 hover:text-white/80">
            {t("common.backToGames")}
          </Link>
        </div>
      </div>
    );
  }

  if (mode === "computer") {
    return (
      <div className="flex flex-col items-center px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">{t("rps.title")}</h1>
        <p className="text-white/70 mb-6">{t("rps.youVsComputer", { you: humanWins, ai: aiWins, target: WINS_NEEDED })}</p>

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
            {t("rps.newMatch")}
          </button>
          <Link to="/" className="rounded-md bg-white/10 px-4 py-2 font-medium hover:bg-white/20 transition-colors">
            {t("common.back")}
          </Link>
        </div>

        {matchOver && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center max-w-sm">
            <h2 className="text-xl font-bold mb-2">{matchWinner === "human" ? t("rps.youWonMatch") : t("rps.computerWonMatch")}</h2>
            <p className="text-white/70 mb-1">{t("rps.matchScore", { score: humanWins * 20 })}</p>
            {bestScore !== null && <p className="text-violet-300">{t("common.yourBestOnThisGame", { score: bestScore })}</p>}
          </div>
        )}
      </div>
    );
  }

  // vs Friend (pass and play)
  return (
    <div className="flex flex-col items-center px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{t("rps.title")}</h1>
      <p className="text-white/70 mb-8">{t("rps.p1VsP2", { p1: p1Wins, p2: p2Wins, target: WINS_NEEDED })}</p>

      {friendPhase === "p1_pick" && (
        <>
          <p className="mb-4 text-lg font-medium">{t("rps.chooseMovePrefix", { player: t("rps.player1") })}</p>
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
          <p className="mb-2 text-lg">{t("rps.lockedIn")}</p>
          <p className="mb-6 text-white/60">{t("rps.passDevice")}</p>
          <button
            onClick={() => setFriendPhase("p2_pick")}
            className="rounded-md bg-violet-600 px-6 py-2 font-medium hover:bg-violet-500 transition-colors"
          >
            {t("rps.revealChoices")}
          </button>
        </div>
      )}

      {friendPhase === "p2_pick" && (
        <>
          <p className="mb-4 text-lg font-medium">{t("rps.chooseMovePrefix", { player: t("rps.player2") })}</p>
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
              ? t("rps.drawRound")
              : compare(p1Move, p2Move) === "p1"
              ? t("rps.p1WinsRound")
              : t("rps.p2WinsRound")}
          </p>
          <button
            onClick={nextFriendRound}
            className="rounded-md bg-violet-600 px-6 py-2 font-medium hover:bg-violet-500 transition-colors"
          >
            {t("rps.nextRound")}
          </button>
        </div>
      )}

      {friendPhase === "match_over" && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center max-w-sm">
          <h2 className="text-xl font-bold mb-2">{p1Wins > p2Wins ? t("rps.p1WonMatch") : t("rps.p2WonMatch")}</h2>
          <p className="text-white/70">{t("common.localMatchNotSaved")}</p>
        </div>
      )}

      <div className="flex gap-3 mt-8">
        <button
          onClick={startGame}
          className="rounded-md bg-violet-600 px-4 py-2 font-medium hover:bg-violet-500 transition-colors"
        >
          {t("rps.newMatch")}
        </button>
        <Link to="/" className="rounded-md bg-white/10 px-4 py-2 font-medium hover:bg-white/20 transition-colors">
          {t("common.back")}
        </Link>
      </div>
    </div>
  );
}
