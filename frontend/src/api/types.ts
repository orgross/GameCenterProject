export type GameKey =
  | "math_game"
  | "memory_game"
  | "tic_tac_toe"
  | "snake"
  | "game_2048"
  | "whack_a_mole"
  | "wordle"
  | "hangman"
  | "connect_four"
  | "rock_paper_scissors";

export const GAME_LABELS: Record<GameKey, string> = {
  math_game: "Math Game",
  memory_game: "Memory Game",
  tic_tac_toe: "Tic-Tac-Toe",
  snake: "Snake",
  game_2048: "2048",
  whack_a_mole: "Whack-a-Mole",
  wordle: "Wordle",
  hangman: "Hangman",
  connect_four: "Connect Four",
  rock_paper_scissors: "Rock-Paper-Scissors",
};

export interface TokenResponse {
  access_token: string;
  token_type: string;
  username: string;
}

export interface MyScore {
  game_key: GameKey;
  best_score: number;
}

export interface LeaderboardEntry {
  game_key: GameKey;
  best_score: number | null;
  holder: string | null;
}
