import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { guessWordle, newWordleGame, type LetterResult, type LetterStatus } from "../../api/wordle";
import { submitScore } from "../../api/scores";

const MAX_ATTEMPTS = 6;
const WORD_LENGTH = 5;
const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

const STATUS_PRIORITY: Record<LetterStatus, number> = { absent: 0, present: 1, correct: 2 };

const STATUS_CLASSES: Record<LetterStatus, string> = {
  correct: "bg-emerald-500 border-emerald-400 text-white",
  present: "bg-amber-500 border-amber-400 text-white",
  absent: "bg-white/10 border-white/10 text-white/50",
};

export function Wordle() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<LetterResult[][]>([]);
  const [current, setCurrent] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [solved, setSolved] = useState(false);
  const [revealedWord, setRevealedWord] = useState<string | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startGame = async () => {
    const game = await newWordleGame();
    setGameId(game.game_id);
    setGuesses([]);
    setCurrent("");
    setGameOver(false);
    setSolved(false);
    setRevealedWord(null);
    setBestScore(null);
    setError(null);
  };

  useEffect(() => {
    startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitGuess = async () => {
    if (!gameId || current.length !== WORD_LENGTH || loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await guessWordle(gameId, current);
      setGuesses((g) => [...g, response.result]);
      setCurrent("");

      if (response.game_over) {
        setGameOver(true);
        setSolved(response.solved);
        setRevealedWord(response.word);
        const score = response.solved ? Math.max(0, (7 - response.attempts_used) * 20) : 0;
        const result = await submitScore("wordle", score);
        setBestScore(result.best_score);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "That doesn't look like a valid guess.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver || loading) return;
      if (e.key === "Enter") {
        submitGuess();
      } else if (e.key === "Backspace") {
        setCurrent((c) => c.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(e.key) && current.length < WORD_LENGTH) {
        setCurrent((c) => (c + e.key).toLowerCase());
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, gameOver, loading, gameId]);

  const keyStatus: Record<string, LetterStatus> = {};
  for (const row of guesses) {
    for (const { letter, status } of row) {
      if (!keyStatus[letter] || STATUS_PRIORITY[status] > STATUS_PRIORITY[keyStatus[letter]]) {
        keyStatus[letter] = status;
      }
    }
  }

  const handleKeyClick = (key: string) => {
    if (gameOver || loading) return;
    if (key === "enter") submitGuess();
    else if (key === "back") setCurrent((c) => c.slice(0, -1));
    else if (current.length < WORD_LENGTH) setCurrent((c) => c + key);
  };

  const rows: (LetterResult[] | null)[] = [
    ...guesses,
    ...(gameOver ? [] : [null]),
    ...Array(Math.max(0, MAX_ATTEMPTS - guesses.length - (gameOver ? 0 : 1))).fill(null),
  ];

  return (
    <div className="flex flex-col items-center px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">🟩 Wordle</h1>
      <p className="text-white/60 mb-6 text-sm">Guess the 5-letter word in {MAX_ATTEMPTS} tries</p>

      <div className="flex flex-col gap-2 mb-6">
        {rows.map((row, ri) => {
          const isCurrentRow = row === null && ri === guesses.length;
          return (
            <div key={ri} className="flex gap-2">
              {Array.from({ length: WORD_LENGTH }).map((_, ci) => {
                if (row) {
                  const cell = row[ci];
                  return (
                    <div
                      key={ci}
                      className={`w-12 h-12 rounded-md border flex items-center justify-center text-xl font-bold uppercase ${STATUS_CLASSES[cell.status]}`}
                    >
                      {cell.letter}
                    </div>
                  );
                }
                const letter = isCurrentRow ? current[ci] : undefined;
                return (
                  <div
                    key={ci}
                    className="w-12 h-12 rounded-md border border-white/20 flex items-center justify-center text-xl font-bold uppercase text-white"
                  >
                    {letter ?? ""}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="flex flex-col items-center gap-1.5 mb-6">
        {KEYBOARD_ROWS.map((row, i) => (
          <div key={i} className="flex gap-1.5">
            {i === 2 && (
              <button
                onClick={() => handleKeyClick("enter")}
                className="px-3 h-10 rounded-md bg-violet-600 text-xs font-bold hover:bg-violet-500"
              >
                ENTER
              </button>
            )}
            {row.split("").map((letter) => (
              <button
                key={letter}
                onClick={() => handleKeyClick(letter)}
                className={`w-8 h-10 rounded-md text-sm font-bold uppercase ${
                  keyStatus[letter] ? STATUS_CLASSES[keyStatus[letter]] : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {letter}
              </button>
            ))}
            {i === 2 && (
              <button
                onClick={() => handleKeyClick("back")}
                className="px-3 h-10 rounded-md bg-white/10 text-xs font-bold hover:bg-white/20"
              >
                ⌫
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={startGame}
          className="rounded-md bg-violet-600 px-4 py-2 font-medium hover:bg-violet-500 transition-colors"
        >
          New word
        </button>
        <Link to="/" className="rounded-md bg-white/10 px-4 py-2 font-medium hover:bg-white/20 transition-colors">
          ← Back
        </Link>
      </div>

      {gameOver && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center max-w-sm">
          <h2 className="text-xl font-bold mb-2">{solved ? "🎉 Solved!" : "😔 Out of guesses"}</h2>
          {revealedWord && <p className="text-white/70 mb-1">The word was "{revealedWord.toUpperCase()}"</p>}
          {bestScore !== null && <p className="text-violet-300">Your best on this game: {bestScore}</p>}
        </div>
      )}
    </div>
  );
}
