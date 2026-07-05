import { apiGet, apiPostJson } from "./client";

export type HangmanStatus = "in_progress" | "won" | "lost";
export const RANDOM_CATEGORY = "random";

export interface CategoryOut {
  key: string;
  label: string;
}

export interface NewGameOut {
  game_id: string;
  word_length: number;
  category: string;
  category_key: string;
  max_wrong: number;
}

export interface GuessOut {
  pattern: string[];
  wrong_guesses: number;
  max_wrong: number;
  guessed_letters: string[];
  status: HangmanStatus;
  word: string | null;
}

export function fetchHangmanCategories(): Promise<CategoryOut[]> {
  return apiGet<CategoryOut[]>("/games/hangman/categories");
}

export function newHangmanGame(category: string, language: "en" | "he" = "en"): Promise<NewGameOut> {
  return apiPostJson<NewGameOut>(`/games/hangman/new?category=${category}&language=${language}`, {});
}

export function guessHangman(gameId: string, letter: string): Promise<GuessOut> {
  return apiPostJson<GuessOut>("/games/hangman/guess", { game_id: gameId, letter });
}
