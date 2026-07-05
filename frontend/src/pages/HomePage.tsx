import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const GAMES = [
  { to: "/games/math", icon: "🧮", key: "math" },
  { to: "/games/memory", icon: "🧠", key: "memory" },
  { to: "/games/tictactoe", icon: "❌⭕", key: "tictactoe" },
  { to: "/games/snake", icon: "🐍", key: "snake" },
  { to: "/games/2048", icon: "🔢", key: "game2048" },
  { to: "/games/whack-a-mole", icon: "🔨", key: "whackAMole" },
  { to: "/games/wordle", icon: "🟩", key: "wordle" },
  { to: "/games/hangman", icon: "🎩", key: "hangman" },
  { to: "/games/connect-four", icon: "🔴", key: "connectFour" },
  { to: "/games/rock-paper-scissors", icon: "✊", key: "rps" },
] as const;

export function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="px-8 py-12 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-2">{t("home.title")}</h1>
      <p className="text-white/60 text-center mb-10">{t("home.subtitle")}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {GAMES.map((game) => (
          <Link
            key={game.to}
            to={game.to}
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 hover:border-violet-400/50 transition-all"
          >
            <div className="text-4xl mb-4">{game.icon}</div>
            <h2 className="text-xl font-semibold mb-2 group-hover:text-violet-300 transition-colors">
              {t(`home.games.${game.key}.title`)}
            </h2>
            <p className="text-sm text-white/60">{t(`home.games.${game.key}.description`)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
