import { apiPostJson } from "./client";

export type Difficulty = "easy" | "hard";
export type Cell = "" | "X" | "O";
export type MoveStatus = "in_progress" | "human_win" | "computer_win" | "draw";

export interface MoveOut {
  board: Cell[];
  move: number | null;
  status: MoveStatus;
  winning_line: number[] | null;
}

export function requestComputerMove(
  board: Cell[],
  computerMark: "X" | "O",
  difficulty: Difficulty
): Promise<MoveOut> {
  return apiPostJson<MoveOut>("/games/tictactoe/move", {
    board,
    computer_mark: computerMark,
    difficulty,
  });
}
