import { apiPostJson } from "./client";

export type LetterStatus = "correct" | "present" | "absent";

export interface NewGameOut {
  game_id: string;
  word_length: number;
  max_attempts: number;
}

export interface LetterResult {
  letter: string;
  status: LetterStatus;
}

export interface GuessOut {
  result: LetterResult[];
  attempts_used: number;
  attempts_remaining: number;
  solved: boolean;
  game_over: boolean;
  word: string | null;
}

export function newWordleGame(): Promise<NewGameOut> {
  return apiPostJson<NewGameOut>("/games/wordle/new", {});
}

export function guessWordle(gameId: string, guess: string): Promise<GuessOut> {
  return apiPostJson<GuessOut>("/games/wordle/guess", { game_id: gameId, guess });
}
