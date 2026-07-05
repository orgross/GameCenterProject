import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { submitScore } from "../../api/scores";
import { useLanguage } from "../../context/LanguageContext";

const EMOJIS = ["🐱", "🐶", "🐯", "🦒", "🐧", "🐘"];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function buildDeck(): Card[] {
  const doubled = [...EMOJIS, ...EMOJIS];
  for (let i = doubled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
  }
  return doubled.map((emoji, id) => ({ id, emoji, isFlipped: false, isMatched: false }));
}

function computeScore(moves: number, seconds: number): number {
  return Math.max(0, 1000 - moves * 10 - seconds * 5);
}

export function MemoryGame() {
  const { t } = useLanguage();
  const [cards, setCards] = useState<Card[]>(() => buildDeck());
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [started, finished]);

  const restart = () => {
    setCards(buildDeck());
    setFlippedIds([]);
    setBusy(false);
    setMoves(0);
    setSeconds(0);
    setStarted(false);
    setFinished(false);
    setFinalScore(0);
    setBestScore(null);
  };

  const handleCardClick = async (card: Card) => {
    if (busy || card.isFlipped || card.isMatched || flippedIds.length === 2) return;
    if (!started) setStarted(true);

    const nextCards = cards.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c));
    setCards(nextCards);
    const nextFlipped = [...flippedIds, card.id];
    setFlippedIds(nextFlipped);

    if (nextFlipped.length === 2) {
      const nextMoves = moves + 1;
      setMoves(nextMoves);
      const [firstId, secondId] = nextFlipped;
      const first = nextCards.find((c) => c.id === firstId)!;
      const second = nextCards.find((c) => c.id === secondId)!;

      if (first.emoji === second.emoji) {
        const matchedCards = nextCards.map((c) =>
          c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
        );
        setCards(matchedCards);
        setFlippedIds([]);

        if (matchedCards.every((c) => c.isMatched)) {
          if (timerRef.current) clearInterval(timerRef.current);
          const score = computeScore(nextMoves, seconds);
          setFinalScore(score);
          setFinished(true);
          try {
            const result = await submitScore("memory_game", score);
            setBestScore(result.best_score);
          } catch {
            // Score save failure shouldn't block showing the result.
          }
        }
      } else {
        setBusy(true);
        setTimeout(() => {
          setCards((current) =>
            current.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c))
          );
          setFlippedIds([]);
          setBusy(false);
        }, 700);
      }
    }
  };

  return (
    <div className="flex flex-col items-center px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{t("memory.title")}</h1>
      <div className="flex gap-6 text-white/70 mb-8 text-sm">
        <span>{t("memory.moves", { moves })}</span>
        <span>{t("memory.time", { seconds })}</span>
        <span>{t("memory.score", { score: computeScore(moves, seconds) })}</span>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card)}
            disabled={card.isMatched}
            className="w-20 h-20 sm:w-24 sm:h-24 [perspective:600px]"
          >
            <div
              className={`relative w-full h-full transition-transform duration-300 [transform-style:preserve-3d] ${
                card.isFlipped || card.isMatched ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              <div className="absolute inset-0 rounded-xl bg-violet-700 border border-white/10 flex items-center justify-center text-2xl [backface-visibility:hidden]">
                ❓
              </div>
              <div
                className={`absolute inset-0 rounded-xl border flex items-center justify-center text-4xl [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                  card.isMatched ? "bg-emerald-600/40 border-emerald-400" : "bg-white/10 border-white/10"
                }`}
              >
                {card.emoji}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={restart}
          className="rounded-md bg-violet-600 px-4 py-2 font-medium hover:bg-violet-500 transition-colors"
        >
          {t("common.restart")}
        </button>
        <Link to="/" className="rounded-md bg-white/10 px-4 py-2 font-medium hover:bg-white/20 transition-colors">
          {t("common.back")}
        </Link>
      </div>

      {finished && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center max-w-sm">
          <h2 className="text-xl font-bold mb-2">{t("memory.solved", { moves })}</h2>
          <p className="text-white/70 mb-1">{t("common.finalScore", { score: finalScore })}</p>
          {bestScore !== null && <p className="text-violet-300">{t("common.yourBestOnThisGame", { score: bestScore })}</p>}
        </div>
      )}
    </div>
  );
}
