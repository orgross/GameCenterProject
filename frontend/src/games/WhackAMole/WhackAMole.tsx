import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { submitScore } from "../../api/scores";
import { useLanguage } from "../../context/LanguageContext";

const HOLE_COUNT = 9;
const ROUND_SECONDS = 30;

export function WhackAMole() {
  const { t } = useLanguage();
  const [activeHole, setActiveHole] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);

  const timeLeftRef = useRef(ROUND_SECONDS);
  const scoreRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Countdown
  useEffect(() => {
    if (!started || gameOver) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, gameOver]);

  // Submit score once the round ends
  useEffect(() => {
    if (!gameOver) return;
    timersRef.current.forEach(clearTimeout);
    submitScore("whack_a_mole", scoreRef.current)
      .then((result) => setBestScore(result.best_score))
      .catch(() => {});
  }, [gameOver]);

  // Mole pop loop — pop duration shortens as the round goes on
  useEffect(() => {
    if (!started || gameOver) return;
    let stopped = false;

    const schedulePop = () => {
      if (stopped) return;
      const hole = Math.floor(Math.random() * HOLE_COUNT);
      setActiveHole(hole);

      const progress = 1 - timeLeftRef.current / ROUND_SECONDS;
      const showMs = Math.max(300, 900 - progress * 500);

      const hideTimer = setTimeout(() => {
        if (stopped) return;
        setActiveHole((current) => (current === hole ? null : current));
        const gapMs = 150 + Math.random() * 250;
        const nextTimer = setTimeout(schedulePop, gapMs);
        timersRef.current.push(nextTimer);
      }, showMs);
      timersRef.current.push(hideTimer);
    };

    schedulePop();
    return () => {
      stopped = true;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [started, gameOver]);

  const handleHoleClick = (i: number) => {
    if (gameOver || i !== activeHole) return;
    setScore((s) => s + 1);
    setActiveHole(null);
  };

  const start = () => setStarted(true);

  const restart = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setActiveHole(null);
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setStarted(false);
    setGameOver(false);
    setBestScore(null);
  };

  return (
    <div className="flex flex-col items-center px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{t("whackAMole.title")}</h1>
      <p className="text-white/60 mb-6 text-sm">{t("whackAMole.status", { score, time: timeLeft })}</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {Array.from({ length: HOLE_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleHoleClick(i)}
            disabled={!started || gameOver}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-5xl overflow-hidden"
          >
            {activeHole === i && "🐹"}
          </button>
        ))}
      </div>

      {!started && !gameOver && (
        <button
          onClick={start}
          className="rounded-md bg-violet-600 px-6 py-2 font-medium hover:bg-violet-500 transition-colors mb-4"
        >
          {t("common.start")}
        </button>
      )}

      <div className="flex gap-3">
        {(started || gameOver) && (
          <button
            onClick={restart}
            className="rounded-md bg-violet-600 px-4 py-2 font-medium hover:bg-violet-500 transition-colors"
          >
            {t("common.restart")}
          </button>
        )}
        <Link to="/" className="rounded-md bg-white/10 px-4 py-2 font-medium hover:bg-white/20 transition-colors">
          {t("common.back")}
        </Link>
      </div>

      {gameOver && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center max-w-sm">
          <h2 className="text-xl font-bold mb-2">{t("whackAMole.timesUp")}</h2>
          <p className="text-white/70 mb-1">{t("common.finalScore", { score })}</p>
          {bestScore !== null && <p className="text-violet-300">{t("common.yourBestOnThisGame", { score: bestScore })}</p>}
        </div>
      )}
    </div>
  );
}
