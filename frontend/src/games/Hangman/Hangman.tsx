import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchHangmanCategories,
  guessHangman,
  newHangmanGame,
  RANDOM_CATEGORY,
  type CategoryOut,
  type HangmanStatus,
} from "../../api/hangman";
import { submitScore } from "../../api/scores";
import { useLanguage } from "../../context/LanguageContext";

const ALPHABET_EN = "abcdefghijklmnopqrstuvwxyz".split("");
const ALPHABET_HE = "אבגדהוזחטיכלמנסעפצקרשת".split("");
type Stage = "settings" | "playing";
type SessionMode = "custom" | "infinite";

function roundScore(status: HangmanStatus, wrongGuesses: number, maxWrong: number): number {
  return status === "won" ? Math.max(0, (maxWrong - wrongGuesses) * 15 + 50) : 0;
}

export function Hangman() {
  const { t, language, setLocked } = useLanguage();
  const alphabet = language === "he" ? ALPHABET_HE : ALPHABET_EN;
  const [stage, setStage] = useState<Stage>("settings");
  const [categories, setCategories] = useState<CategoryOut[]>([]);
  const [category, setCategory] = useState<string>(RANDOM_CATEGORY);
  const [sessionMode, setSessionMode] = useState<SessionMode>("custom");
  const [customCount, setCustomCount] = useState(5);

  const [gameId, setGameId] = useState<string | null>(null);
  const [wordCategoryKey, setWordCategoryKey] = useState("");
  const [pattern, setPattern] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [maxWrong, setMaxWrong] = useState(6);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [status, setStatus] = useState<HangmanStatus>("in_progress");
  const [revealedWord, setRevealedWord] = useState<string | null>(null);

  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);

  useEffect(() => {
    fetchHangmanCategories().then(setCategories).catch(() => {});
  }, []);

  // Word content and the on-screen keyboard are language-dependent — lock the
  // global language toggle for the duration of a session so switching mid-word
  // can't desync the keyboard from the word being guessed.
  useEffect(() => {
    setLocked(stage === "playing");
    return () => setLocked(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const startRound = async () => {
    const game = await newHangmanGame(category, language);
    setGameId(game.game_id);
    setWordCategoryKey(game.category_key);
    setMaxWrong(game.max_wrong);
    setPattern(Array(game.word_length).fill("_"));
    setWrongGuesses(0);
    setGuessedLetters([]);
    setStatus("in_progress");
    setRevealedWord(null);
  };

  const startSession = async () => {
    setRoundsCompleted(0);
    setSessionScore(0);
    setSessionFinished(false);
    setBestScore(null);
    setStage("playing");
    await startRound();
  };

  const finishSession = async (finalScore: number) => {
    setSessionFinished(true);
    try {
      const result = await submitScore("hangman", finalScore);
      setBestScore(result.best_score);
    } catch {
      // Not fatal if the score can't be saved.
    }
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
      const nextRoundsCompleted = roundsCompleted + 1;
      const nextSessionScore = sessionScore + roundScore(response.status, response.wrong_guesses, maxWrong);
      setRoundsCompleted(nextRoundsCompleted);
      setSessionScore(nextSessionScore);

      if (sessionMode === "custom" && nextRoundsCompleted >= customCount) {
        await finishSession(nextSessionScore);
      }
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (stage !== "playing" || status !== "in_progress") return;
      if (/^[a-zA-Zא-ת]$/.test(e.key)) handleGuess(e.key.toLowerCase());
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, status, gameId, guessedLetters]);

  if (stage === "settings") {
    return (
      <div className="flex justify-center items-center px-4 py-20">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">{t("hangman.title")}</h1>

          <label className="block text-sm mb-1 text-white/70">{t("hangman.category")}</label>
          <select
            className="w-full mb-4 rounded-md bg-black/30 border border-white/10 px-3 py-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value={RANDOM_CATEGORY}>{t("hangman.random")}</option>
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {t(`hangman.categories.${c.key}`)}
              </option>
            ))}
          </select>

          <label className="block text-sm mb-1 text-white/70">{t("hangman.play")}</label>
          <select
            className="w-full mb-4 rounded-md bg-black/30 border border-white/10 px-3 py-2"
            value={sessionMode}
            onChange={(e) => setSessionMode(e.target.value as SessionMode)}
          >
            <option value="custom">{t("hangman.customCount")}</option>
            <option value="infinite">{t("hangman.infinite")}</option>
          </select>

          {sessionMode === "custom" && (
            <>
              <label className="block text-sm mb-1 text-white/70">{t("hangman.numberOfWords")}</label>
              <input
                type="number"
                min={1}
                max={50}
                className="w-full mb-6 rounded-md bg-black/30 border border-white/10 px-3 py-2"
                value={customCount}
                onChange={(e) => setCustomCount(Math.max(1, Number(e.target.value) || 1))}
              />
            </>
          )}
          {sessionMode === "infinite" && <div className="mb-6" />}

          <button
            onClick={startSession}
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

  const remainingLives = maxWrong - wrongGuesses;
  const roundOver = status !== "in_progress";
  const canFinishNow = sessionMode === "infinite" && !sessionFinished;
  const canContinue =
    roundOver && !sessionFinished && (sessionMode === "infinite" || roundsCompleted < customCount);

  return (
    <div className="flex flex-col items-center px-4 py-12">
      <h1 className="text-3xl font-bold mb-1">{t("hangman.title")}</h1>
      <p className="text-white/50 text-xs uppercase tracking-wide mb-1">
        {t("hangman.categoryLabel", { category: t(`hangman.categories.${wordCategoryKey}`) })}
      </p>
      <p className="text-white/50 text-xs mb-6">
        {sessionMode === "custom"
          ? t("hangman.wordProgress", { current: Math.min(roundsCompleted + 1, customCount), total: customCount })
          : t("hangman.wordProgressInfinite", { current: roundsCompleted + 1, score: sessionScore })}
      </p>

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
        {alphabet.map((letter) => {
          const guessedAlready = guessedLetters.includes(letter);
          const correct = guessedAlready && pattern.includes(letter);
          return (
            <button
              key={letter}
              onClick={() => handleGuess(letter)}
              disabled={guessedAlready || status !== "in_progress"}
              className={`w-9 h-9 rounded-md text-sm font-bold uppercase transition-colors ${
                guessedAlready
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

      <div className="flex gap-3 flex-wrap justify-center">
        {canContinue && (
          <button
            onClick={startRound}
            className="rounded-md bg-violet-600 px-4 py-2 font-medium hover:bg-violet-500 transition-colors"
          >
            {t("hangman.nextWord")}
          </button>
        )}
        {canFinishNow && (
          <button
            onClick={() => finishSession(sessionScore)}
            className="rounded-md bg-white/10 px-4 py-2 font-medium hover:bg-white/20 transition-colors"
          >
            {t("hangman.finishRun")}
          </button>
        )}
        <button
          onClick={() => setStage("settings")}
          className="rounded-md bg-white/10 px-4 py-2 font-medium hover:bg-white/20 transition-colors"
        >
          {t("common.newGame")}
        </button>
        <Link to="/" className="rounded-md bg-white/10 px-4 py-2 font-medium hover:bg-white/20 transition-colors">
          {t("common.back")}
        </Link>
      </div>

      {roundOver && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center max-w-sm">
          <h2 className="text-xl font-bold mb-2">{status === "won" ? t("hangman.youWon") : t("hangman.youLost")}</h2>
          {revealedWord && <p className="text-white/70 mb-1">{t("hangman.wordWas", { word: revealedWord.toUpperCase() })}</p>}
          {sessionFinished && (
            <>
              <p className="text-white/70 mb-1">
                {t("hangman.runComplete", { count: roundsCompleted, score: sessionScore })}
              </p>
              {bestScore !== null && <p className="text-violet-300">{t("common.yourBestOnThisGame", { score: bestScore })}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
