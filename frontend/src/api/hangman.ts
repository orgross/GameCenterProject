import { apiPostJson } from "./client";

export type Difficulty = "easy" | "medium" | "hard";
export type HangmanStatus = "in_progress" | "won" | "lost";

export interface NewGameOut {
  game_id: string;
  word_length: number;
  category: string;
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

export function newHangmanGame(difficulty: Difficulty): Promise<NewGameOut> {
  return apiPostJson<NewGameOut>(`/games/hangman/new?difficulty=${difficulty}`, {});
}

export function guessHangman(gameId: string, letter: string): Promise<GuessOut> {
  return apiPostJson<GuessOut>("/games/hangman/guess", { game_id: gameId, letter });
}
