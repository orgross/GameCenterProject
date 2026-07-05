import { useState } from "react";
import { Link } from "react-router-dom";
import { requestComputerMove, type Cell, type Difficulty } from "../../api/tictactoe";
import { findWinningLine, isBoardFull } from "../shared/boardWinCheck";
import { submitScore } from "../../api/scores";

type Mode = "computer" | "friend";
type Stage = "settings" | "playing";
type Outcome = "in_progress" | "x_win" | "o_win" | "draw";

const EMPTY_BOARD: Cell[] = Array(9).fill("");
const MIN_WIN_MOVES = 3;

function scoreFor(outcome: Outcome, humanMoves: number): number {
  if (outcome === "x_win") return Math.max(20, 100 - 10 * (humanMoves - MIN_WIN_MOVES));
  if (outcome === "draw") return 20;
  return 0;
}

function outcomeMessage(outcome: Outcome, mode: Mode): string {
  if (outcome === "draw") return "🤝 It's a draw!";
  if (outcome === "x_win") return mode === "computer" ? "🎉 You win!" : "❌ Player 1 (X) wins!";
  if (outcome === "o_win") return mode === "computer" ? "💻 Computer wins!" : "⭕ Player 2 (O) wins!";
  return "";
}

export function TicTacToe() {
  const [stage, setStage] = useState<Stage>("settings");
  const [mode, setMode] = useState<Mode>("computer");
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");

  const [board, setBoard] = useState<Cell[]>(EMPTY_BOARD);
  const [currentTurn, setCurrentTurn] = useState<"X" | "O">("X");
  const [humanMoves, setHumanMoves] = useState(0);
  const [outcome, setOutcome] = useState<Outcome>("in_progress");
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [thinking, setThinking] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);

  const startGame = () => {
    setBoard(EMPTY_BOARD);
    setCurrentTurn("X");
    setHumanMoves(0);
    setOutcome("in_progress");
    setWinningLine(null);
    setThinking(false);
    setBestScore(null);
    setStage("playing");
  };

  const finalize = async (finalOutcome: Outcome, moves: number) => {
    try {
      const result = await submitScore("tic_tac_toe", scoreFor(finalOutcome, moves));
      setBestScore(result.best_score);
    } catch {
      // Not fatal if the score can't be saved.
    }
  };

  const handleCellClick = async (index: number) => {
    if (board[index] !== "" || outcome !== "in_progress" || thinking) return;
    if (mode === "computer" && currentTurn !== "X") return;

    const mark = mode === "friend" ? currentTurn : "X";
    const nextBoard = [...board];
    nextBoard[index] = mark;
    const winLine = findWinningLine(nextBoard, 3, 3, 3, mark);
    const full = isBoardFull(nextBoard);
    setBoard(nextBoard);

    if (mode === "friend") {
      if (winLine) {
        setOutcome(mark === "X" ? "x_win" : "o_win");
        setWinningLine(winLine);
      } else if (full) {
        setOutcome("draw");
      } else {
        setCurrentTurn(mark === "X" ? "O" : "X");
      }
      return;
    }

    const nextHumanMoves = humanMoves + 1;
    setHumanMoves(nextHumanMoves);

    if (winLine) {
      setOutcome("x_win");
      setWinningLine(winLine);
      await finalize("x_win", nextHumanMoves);
      return;
    }
    if (full) {
      setOutcome("draw");
      await finalize("draw", nextHumanMoves);
      return;
    }

    setThinking(true);
    try {
      const result = await requestComputerMove(nextBoard, "O", difficulty);
      setBoard(result.board);
      setWinningLine(result.winning_line);

      if (result.status === "computer_win") {
        setOutcome("o_win");
        await finalize("o_win", nextHumanMoves);
      } else if (result.status === "draw") {
        setOutcome("draw");
        await finalize("draw", nextHumanMoves);
      }
    } finally {
      setThinking(false);
    }
  };

  if (stage === "settings") {
    return (
      <div className="flex justify-center items-center px-4 py-20">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">❌⭕ Tic-Tac-Toe</h1>

          <label className="block text-sm mb-1 text-white/70">Mode</label>
          <select
            className="w-full mb-4 rounded-md bg-black/30 border border-white/10 px-3 py-2"
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
          >
            <option value="computer">vs Computer</option>
            <option value="friend">vs Friend (same computer)</option>
          </select>

          {mode === "computer" && (
            <>
              <label className="block text-sm mb-1 text-white/70">Computer difficulty</label>
              <select
                className="w-full mb-6 rounded-md bg-black/30 border border-white/10 px-3 py-2"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
                <option value="easy">Easy</option>
                <option value="hard">Hard (unbeatable)</option>
              </select>
            </>
          )}

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

  return (
    <div className="flex flex-col items-center px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">❌⭕ Tic-Tac-Toe</h1>
      <p className="text-white/70 mb-6">
        {outcome !== "in_progress"
          ? outcomeMessage(outcome, mode)
          : thinking
          ? "Computer is thinking..."
          : mode === "friend"
          ? `${currentTurn === "X" ? "Player 1 (X)" : "Player 2 (O)"}'s turn`
          : "Your turn (X)"}
      </p>

      <div className="grid grid-cols-3 gap-2 mb-8">
        {board.map((cell, i) => {
          const isWinningCell = winningLine?.includes(i);
          return (
            <button
              key={i}
              onClick={() => handleCellClick(i)}
              disabled={cell !== "" || outcome !== "in_progress" || thinking}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl border text-4xl font-bold flex items-center justify-center transition-colors ${
                isWinningCell
                  ? "bg-emerald-600/40 border-emerald-400"
                  : "bg-white/10 border-white/10 hover:bg-white/20"
              } ${cell === "X" ? "text-sky-300" : "text-rose-300"}`}
            >
              {cell}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={startGame}
          className="rounded-md bg-violet-600 px-4 py-2 font-medium hover:bg-violet-500 transition-colors"
        >
          New Game
        </button>
        <button
          onClick={() => setStage("settings")}
          className="rounded-md bg-white/10 px-4 py-2 font-medium hover:bg-white/20 transition-colors"
        >
          Change settings
        </button>
        <Link to="/" className="rounded-md bg-white/10 px-4 py-2 font-medium hover:bg-white/20 transition-colors">
          ← Back
        </Link>
      </div>

      {outcome !== "in_progress" && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center max-w-sm">
          <h2 className="text-xl font-bold mb-2">{outcomeMessage(outcome, mode)}</h2>
          {mode === "computer" && (
            <>
              <p className="text-white/70 mb-1">Score this round: {scoreFor(outcome, humanMoves)}</p>
              {bestScore !== null && <p className="text-violet-300">Your best on this game: {bestScore}</p>}
            </>
          )}
          {mode === "friend" && <p className="text-white/70">Local match — not saved to the leaderboard.</p>}
        </div>
      )}
    </div>
  );
}
