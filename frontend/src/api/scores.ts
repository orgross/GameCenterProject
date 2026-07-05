import { apiGet, apiPostJson } from "./client";
import type { GameKey, LeaderboardEntry, MyScore } from "./types";

export function fetchMyScores(): Promise<MyScore[]> {
  return apiGet<MyScore[]>("/scores/me", true);
}

export function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  return apiGet<LeaderboardEntry[]>("/scores/leaderboard");
}

export function submitScore(gameKey: GameKey, score: number): Promise<MyScore> {
  return apiPostJson<MyScore>(`/scores/${gameKey}`, { score }, true);
}
