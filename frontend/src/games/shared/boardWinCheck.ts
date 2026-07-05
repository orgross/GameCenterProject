const DIRECTIONS: Array<[number, number]> = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

function idx(row: number, col: number, cols: number): number {
  return row * cols + col;
}

/**
 * Generic "N in a row" check over a flat row-major board.
 * Works for Tic-Tac-Toe (3x3, length 3) and Connect Four (6x7, length 4).
 */
export function findWinningLine(
  board: string[],
  rows: number,
  cols: number,
  winLength: number,
  mark: string
): number[] | null {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[idx(r, c, cols)] !== mark) continue;

      for (const [dr, dc] of DIRECTIONS) {
        const cells = [idx(r, c, cols)];
        let rr = r;
        let cc = c;
        let ok = true;

        for (let k = 1; k < winLength; k++) {
          rr += dr;
          cc += dc;
          if (rr < 0 || rr >= rows || cc < 0 || cc >= cols || board[idx(rr, cc, cols)] !== mark) {
            ok = false;
            break;
          }
          cells.push(idx(rr, cc, cols));
        }

        if (ok) return cells;
      }
    }
  }
  return null;
}

export function isBoardFull(board: string[]): boolean {
  return board.every((cell) => cell !== "");
}

/** Drops a mark into the lowest empty row of `col` (Connect-Four-style gravity). Returns the row used, or null if full. */
export function dropInColumn(board: string[], rows: number, cols: number, col: number, mark: string): number | null {
  for (let row = rows - 1; row >= 0; row--) {
    const i = idx(row, col, cols);
    if (board[i] === "") {
      board[i] = mark;
      return row;
    }
  }
  return null;
}
