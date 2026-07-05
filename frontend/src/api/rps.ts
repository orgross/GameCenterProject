import { apiPostJson } from "./client";

export type Move = "rock" | "paper" | "scissors";
export type RoundResult = "human_win" | "ai_win" | "draw";

export interface NewGameOut {
  game_id: string;
  wins_needed: number;
}

export interface PlayOut {
  human_move: Move;
  ai_move: Move;
  result: RoundResult;
  human_wins: number;
  ai_wins: number;
  match_over: boolean;
  match_winner: "human" | "ai" | null;
}

export function newRpsGame(): Promise<NewGameOut> {
  return apiPostJson<NewGameOut>("/games/rps/new", {});
}

export function playRps(gameId: string, move: Move): Promise<PlayOut> {
  return apiPostJson<PlayOut>("/games/rps/play", { game_id: gameId, move });
}
