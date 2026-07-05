import { useEffect, useState } from "react";
import { fetchLeaderboard, fetchMyScores } from "../api/scores";
import type { GameKey, LeaderboardEntry, MyScore } from "../api/types";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const GAME_ORDER: GameKey[] = [
  "math_game",
  "memory_game",
  "tic_tac_toe",
  "snake",
  "game_2048",
  "whack_a_mole",
  "wordle",
  "hangman",
  "connect_four",
  "rock_paper_scissors",
];

const GAME_KEY_TO_I18N: Record<GameKey, string> = {
  math_game: "math",
  memory_game: "memory",
  tic_tac_toe: "tictactoe",
  snake: "snake",
  game_2048: "game2048",
  whack_a_mole: "whackAMole",
  wordle: "wordle",
  hangman: "hangman",
  connect_four: "connectFour",
  rock_paper_scissors: "rps",
};

export function ScoresPage() {
  const { username } = useAuth();
  const { t } = useLanguage();
  const [mine, setMine] = useState<Record<GameKey, number>>({} as Record<GameKey, number>);
  const [leaderboard, setLeaderboard] = useState<Record<GameKey, LeaderboardEntry>>(
    {} as Record<GameKey, LeaderboardEntry>
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchMyScores(), fetchLeaderboard()])
      .then(([myScores, board]: [MyScore[], LeaderboardEntry[]]) => {
        if (cancelled) return;
        setMine(Object.fromEntries(myScores.map((s) => [s.game_key, s.best_score])) as Record<GameKey, number>);
        setLeaderboard(Object.fromEntries(board.map((e) => [e.game_key, e])) as Record<GameKey, LeaderboardEntry>);
      })
      .catch(() => !cancelled && setError(t("scores.error")))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="px-8 py-12 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-10">{t("scores.title")}</h1>

      {loading && <p className="text-center text-white/60">{t("scores.loading")}</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-start">
            <thead className="bg-white/10 text-sm uppercase tracking-wide text-white/60">
              <tr>
                <th className="px-5 py-3">{t("scores.game")}</th>
                <th className="px-5 py-3">{t("scores.yourBest")}</th>
                <th className="px-5 py-3">{t("scores.globalBest")}</th>
                <th className="px-5 py-3">{t("scores.heldBy")}</th>
              </tr>
            </thead>
            <tbody>
              {GAME_ORDER.map((key) => {
                const entry = leaderboard[key];
                const isMe = entry?.holder && entry.holder === username;
                return (
                  <tr key={key} className="border-t border-white/10">
                    <td className="px-5 py-4 font-medium">{t(`home.games.${GAME_KEY_TO_I18N[key]}.title`)}</td>
                    <td className="px-5 py-4">{mine[key] ?? 0}</td>
                    <td className="px-5 py-4">{entry?.best_score ?? "—"}</td>
                    <td className={`px-5 py-4 ${isMe ? "text-violet-300 font-semibold" : ""}`}>
                      {entry?.holder ?? "—"}
                      {isMe && t("scores.you")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
