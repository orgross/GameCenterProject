import { apiPostJson } from "./client";

export type Difficulty = "easy" | "hard";
export type Cell = "" | "X" | "O";
export type MoveStatus = "in_progress" | "human_win" | "computer_win" | "draw";

export const ROWS = 6;
export const COLS = 7;

export interface MoveOut {
  board: Cell[];
  column: number | null;
  status: MoveStatus;
  winning_line: number[] | null;
}

export function requestComputerMove(
  board: Cell[],
  computerMark: "X" | "O",
  difficulty: Difficulty
): Promise<MoveOut> {
  return apiPostJson<MoveOut>("/games/connect_four/move", {
    board,
    computer_mark: computerMark,
    difficulty,
  });
}
