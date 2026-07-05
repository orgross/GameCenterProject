import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { guessHangman, newHangmanGame, type Difficulty, type HangmanStatus } from "../../api/hangman";
import { submitScore } from "../../api/scores";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

type Stage = "settings" | "playing";

export function Hangman() {
  const [stage, setStage] = useState<Stage>("settings");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  const [gameId, setGameId] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [pattern, setPattern] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [maxWrong, setMaxWrong] = useState(6);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [status, setStatus] = useState<HangmanStatus>("in_progress");
  const [revealedWord, setRevealedWord] = useState<string | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);

  const startGame = async () => {
    const game = await newHangmanGame(difficulty);
    setGameId(game.game_id);
    setCategory(game.category);
    setMaxWrong(game.max_wrong);
    setPattern(Array(game.word_length).fill("_"));
    setWrongGuesses(0);
    setGuessedLetters([]);
    setStatus("in_progress");
    setRevealedWord(null);
    setBestScore(null);
    setStage("playing");
  };

  const handleGuess = async (letter: string) => {
    if (!gameId || status !== "in_progress" || guessedLetters.includes(letter)) return;

    const response = await guessHangman(gameId, letter);
    setPattern(response.pattern);
    setWrongGuesses(response.wrong_guesses);
    setGuessedLetters(response.guessed_letters);
    setStatus(response.status);

    if (response.status !== "in_progress") {
      setRevealedWord(response.word);
      const score = response.status === "won" ? Math.max(0, (maxWrong - response.wrong_guesses) * 15 + 50) : 0;
      const result = await submitScore("hangman", score);
      setBestScore(result.best_score);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (stage !== "playing" || status !== "in_progress") return;
      if (/^[a-zA-Z]$/.test(e.key)) handleGuess(e.key.toLowerCase());
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, status, gameId, guessedLetters]);

  if (stage === "settings") {
    return (
      <div className="flex justify-center items-center px-4 py-20">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">🎩 Hangman</h1>

          <label className="block text-sm mb-1 text-white/70">Difficulty (word length)</label>
          <select
            className="w-full mb-6 rounded-md bg-black/30 border border-white/10 px-3 py-2"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          >
            <option value="easy">Easy (4-5 letters)</option>
            <option value="medium">Medium (6-7 letters)</option>
            <option value="hard">Hard (8+ letters)</option>
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

  const remainingLives = maxWrong - wrongGuesses;

  return (
    <div className="flex flex-col items-center px-4 py-12">
      <h1 className="text-3xl font-bold mb-1">🎩 Hangman</h1>
      <p className="text-white/50 text-xs uppercase tracking-wide mb-6">Category: {category}</p>

      <p className="text-2xl mb-6">
        {"❤️".repeat(Math.max(0, remainingLives))}
        {"🖤".repeat(wrongGuesses)}
      </p>

      <div className="flex gap-2 mb-8 flex-wrap justify-center">
        {pattern.map((ch, i) => (
          <div
            key={i}
            className="w-10 h-12 rounded-md border-b-2 border-white/30 flex items-center justify-center text-xl font-bold uppercase"
          >
            {ch !== "_" ? ch : ""}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-9 sm:grid-cols-13 gap-1.5 mb-8 max-w-lg">
        {ALPHABET.map((letter) => {
          const guessed = guessedLetters.includes(letter);
          const correct = guessed && pattern.includes(letter);
          return (
            <button
              key={letter}
              onClick={() => handleGuess(letter)}
              disabled={guessed || status !== "in_progress"}
              className={`w-9 h-9 rounded-md text-sm font-bold uppercase transition-colors ${
                guessed
                  ? correct
                    ? "bg-emerald-600 text-white"
                    : "bg-white/5 text-white/30"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStage("settings")}
          className="rounded-md bg-violet-600 px-4 py-2 font-medium hover:bg-violet-500 transition-colors"
        >
          New game
        </button>
        <Link to="/" className="rounded-md bg-white/10 px-4 py-2 font-medium hover:bg-white/20 transition-colors">
          ← Back
        </Link>
      </div>

      {status !== "in_progress" && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center max-w-sm">
          <h2 className="text-xl font-bold mb-2">{status === "won" ? "🎉 You won!" : "💀 You lost"}</h2>
          {revealedWord && <p className="text-white/70 mb-1">The word was "{revealedWord.toUpperCase()}"</p>}
          {bestScore !== null && <p className="text-violet-300">Your best on this game: {bestScore}</p>}
        </div>
      )}
    </div>
  );
}
