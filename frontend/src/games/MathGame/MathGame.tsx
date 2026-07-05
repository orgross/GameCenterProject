import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProblem, submitAnswer, type Difficulty, type ProblemOut } from "../../api/mathGame";
import { submitScore } from "../../api/scores";
import { useLanguage } from "../../context/LanguageContext";

type Stage = "settings" | "playing" | "finished";
type Feedback = { kind: "correct" | "wrong"; message: string } | null;

const STREAK_BONUS_STEP = 2;

export function MathGame() {
  const { t } = useLanguage();
  const [stage, setStage] = useState<Stage>("settings");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [goal, setGoal] = useState(100);

  const [problem, setProblem] = useState<ProblemOut | null>(null);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadProblem = async () => {
    setFeedback(null);
    setAnswer("");
    const next = await fetchProblem(difficulty);
    setProblem(next);
  };

  useEffect(() => {
    if (stage === "playing") {
      inputRef.current?.focus();
    }
  }, [stage, problem]);

  const startGame = async () => {
    setScore(0);
    setStreak(0);
    setStage("playing");
    await loadProblem();
  };

  const finishGame = async (finalScore: number) => {
    setStage("finished");
    try {
      const result = await submitScore("math_game", finalScore);
      setBestScore(result.best_score);
    } catch {
      // Not fatal to the game if the score fails to save (e.g. network hiccup).
    }
  };

  const handleSubmit = async () => {
    if (!problem || answer.trim() === "") return;
    const parsed = Number(answer);
    if (Number.isNaN(parsed)) {
      setFeedback({ kind: "wrong", message: t("math.invalidNumber") });
      return;
    }

    const result = await submitAnswer(problem.problem_id, parsed);

    if (result.correct) {
      const nextStreak = streak + 1;
      const bonus = nextStreak * STREAK_BONUS_STEP;
      const nextScore = score + 10 + bonus;
      setStreak(nextStreak);
      setScore(nextScore);
      setFeedback({ kind: "correct", message: t("math.correct", { amount: 10 + bonus, streak: nextStreak }) });

      if (nextScore >= goal) {
        await finishGame(nextScore);
        return;
      }
    } else {
      const nextScore = Math.max(0, score - 5);
      setStreak(0);
      setScore(nextScore);
      setFeedback({ kind: "wrong", message: t("math.wrong", { answer: result.correct_answer }) });
    }

    await loadProblem();
  };

  if (stage === "settings") {
    return (
      <div className="flex justify-center items-center px-4 py-20">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">{t("math.title")}</h1>

          <label className="block text-sm mb-1 text-white/70">{t("math.difficulty")}</label>
          <select
            className="w-full mb-4 rounded-md bg-black/30 border border-white/10 px-3 py-2"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          >
            <option value="easy">{t("math.easy")}</option>
            <option value="medium">{t("math.medium")}</option>
            <option value="hard">{t("math.hard")}</option>
          </select>

          <label className="block text-sm mb-1 text-white/70">{t("math.scoreGoal")}</label>
          <input
            type="number"
            min={10}
            step={10}
            className="w-full mb-6 rounded-md bg-black/30 border border-white/10 px-3 py-2"
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value) || 10)}
          />

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

  if (stage === "finished") {
    return (
      <div className="flex justify-center items-center px-4 py-20">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">{t("math.goalReached")}</h1>
          <p className="text-white/70 mb-6">{t("common.finalScore", { score })}</p>
          {bestScore !== null && (
            <p className="text-violet-300 mb-6">{t("common.yourBestOnThisGame", { score: bestScore })}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setStage("settings")}
              className="flex-1 rounded-md bg-violet-600 py-2 font-medium hover:bg-violet-500 transition-colors"
            >
              {t("common.playAgain")}
            </button>
            <Link
              to="/scores"
              className="flex-1 rounded-md bg-white/10 py-2 font-medium hover:bg-white/20 transition-colors text-center"
            >
              {t("common.viewScores")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progressPct = Math.min(100, Math.round((score / goal) * 100));

  return (
    <div className="flex justify-center items-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
        <div className="flex justify-between text-sm text-white/60 mb-2">
          <span>{t("math.scoreLabel", { score })}</span>
          <span>{t("math.goalLabel", { goal })}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/10 mb-8 overflow-hidden">
          <div
            className="h-full bg-violet-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <p className="text-center text-white/60 mb-2">{t("math.whatsResult")}</p>
        <p className="text-center text-3xl font-bold mb-8">{problem?.expression}</p>

        <input
          ref={inputRef}
          type="number"
          className="w-full mb-4 rounded-md bg-black/30 border border-white/10 px-3 py-2 text-center text-lg"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        <button
          onClick={handleSubmit}
          className="w-full rounded-md bg-violet-600 py-2 font-medium hover:bg-violet-500 transition-colors"
        >
          {t("math.submit")}
        </button>

        {feedback && (
          <p
            className={`mt-4 text-center font-medium ${
              feedback.kind === "correct" ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {feedback.message}
          </p>
        )}

        {streak > 1 && <p className="mt-2 text-center text-sm text-amber-300">{t("math.streak", { streak })}</p>}
      </div>
    </div>
  );
}
