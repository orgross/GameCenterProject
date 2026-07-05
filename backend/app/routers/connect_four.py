import math
import random
from enum import Enum

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator

router = APIRouter(prefix="/games/connect_four", tags=["connect-four"])

ROWS = 6
COLS = 7
WIN_LENGTH = 4
HARD_SEARCH_DEPTH = 5
EASY_SEARCH_DEPTH = 2


class Difficulty(str, Enum):
    EASY = "easy"
    HARD = "hard"


class MoveIn(BaseModel):
    board: list[str]
    computer_mark: str
    difficulty: Difficulty = Difficulty.HARD

    @field_validator("board")
    @classmethod
    def validate_board(cls, board: list[str]) -> list[str]:
        if len(board) != ROWS * COLS or any(cell not in ("", "X", "O") for cell in board):
            raise ValueError(f"board must have {ROWS * COLS} cells, each '', 'X' or 'O'")
        return board

    @field_validator("computer_mark")
    @classmethod
    def validate_mark(cls, mark: str) -> str:
        if mark not in ("X", "O"):
            raise ValueError("computer_mark must be 'X' or 'O'")
        return mark


class MoveOut(BaseModel):
    board: list[str]
    column: int | None
    status: str
    winning_line: list[int] | None = None


def _idx(row: int, col: int) -> int:
    return row * COLS + col


def _valid_columns(board: list[str]) -> list[int]:
    return [col for col in range(COLS) if board[_idx(0, col)] == ""]


def _drop(board: list[str], col: int, mark: str) -> int:
    for row in range(ROWS - 1, -1, -1):
        if board[_idx(row, col)] == "":
            board[_idx(row, col)] = mark
            return row
    raise ValueError("column is full")


def _all_lines() -> list[list[int]]:
    lines: list[list[int]] = []
    for row in range(ROWS):
        for col in range(COLS - WIN_LENGTH + 1):
            lines.append([_idx(row, col + i) for i in range(WIN_LENGTH)])
    for col in range(COLS):
        for row in range(ROWS - WIN_LENGTH + 1):
            lines.append([_idx(row + i, col) for i in range(WIN_LENGTH)])
    for row in range(ROWS - WIN_LENGTH + 1):
        for col in range(COLS - WIN_LENGTH + 1):
            lines.append([_idx(row + i, col + i) for i in range(WIN_LENGTH)])
    for row in range(ROWS - WIN_LENGTH + 1):
        for col in range(WIN_LENGTH - 1, COLS):
            lines.append([_idx(row + i, col - i) for i in range(WIN_LENGTH)])
    return lines


_LINES = _all_lines()


def _winning_line(board: list[str], mark: str) -> list[int] | None:
    for line in _LINES:
        if all(board[i] == mark for i in line):
            return line
    return None


def _is_full(board: list[str]) -> bool:
    return all(cell != "" for cell in board)


def _score_window(cells: list[str], mark: str, opponent: str) -> int:
    mine = cells.count(mark)
    theirs = cells.count(opponent)
    empty = cells.count("")

    if mine == 4:
        return 100_000
    if mine == 3 and empty == 1:
        return 50
    if mine == 2 and empty == 2:
        return 10
    if theirs == 3 and empty == 1:
        return -80
    if theirs == 4:
        return -100_000
    return 0


def _evaluate(board: list[str], mark: str, opponent: str) -> int:
    score = 0
    center_col = COLS // 2
    center_count = sum(1 for row in range(ROWS) if board[_idx(row, center_col)] == mark)
    score += center_count * 6

    for line in _LINES:
        score += _score_window([board[i] for i in line], mark, opponent)

    return score


def _minimax(
    board: list[str],
    depth: int,
    alpha: float,
    beta: float,
    maximizing: bool,
    computer_mark: str,
    human_mark: str,
) -> tuple[int | None, int]:
    valid = _valid_columns(board)

    if _winning_line(board, computer_mark):
        return None, 1_000_000 + depth
    if _winning_line(board, human_mark):
        return None, -1_000_000 - depth
    if not valid:
        return None, 0
    if depth == 0:
        return None, _evaluate(board, computer_mark, human_mark)

    best_col = random.choice(valid)

    if maximizing:
        value = -math.inf
        for col in valid:
            trial = board.copy()
            _drop(trial, col, computer_mark)
            _, new_score = _minimax(trial, depth - 1, alpha, beta, False, computer_mark, human_mark)
            if new_score > value:
                value, best_col = new_score, col
            alpha = max(alpha, value)
            if alpha >= beta:
                break
        return best_col, int(value)
    else:
        value = math.inf
        for col in valid:
            trial = board.copy()
            _drop(trial, col, human_mark)
            _, new_score = _minimax(trial, depth - 1, alpha, beta, True, computer_mark, human_mark)
            if new_score < value:
                value, best_col = new_score, col
            beta = min(beta, value)
            if alpha >= beta:
                break
        return best_col, int(value)


def _best_column(board: list[str], computer_mark: str, human_mark: str, difficulty: Difficulty) -> int:
    valid = _valid_columns(board)

    if difficulty == Difficulty.EASY and random.random() < 0.5:
        return random.choice(valid)

    depth = HARD_SEARCH_DEPTH if difficulty == Difficulty.HARD else EASY_SEARCH_DEPTH
    col, _ = _minimax(board, depth, -math.inf, math.inf, True, computer_mark, human_mark)
    return col if col is not None else random.choice(valid)


@router.post("/move", response_model=MoveOut)
def make_move(payload: MoveIn):
    board = list(payload.board)
    computer_mark = payload.computer_mark
    human_mark = "O" if computer_mark == "X" else "X"

    human_win = _winning_line(board, human_mark)
    if human_win:
        return MoveOut(board=board, column=None, status="human_win", winning_line=human_win)
    if _is_full(board):
        return MoveOut(board=board, column=None, status="draw")

    col = _best_column(board, computer_mark, human_mark, payload.difficulty)
    try:
        _drop(board, col, computer_mark)
    except ValueError:
        raise HTTPException(status_code=400, detail="Selected column is full")

    computer_win = _winning_line(board, computer_mark)
    if computer_win:
        return MoveOut(board=board, column=col, status="computer_win", winning_line=computer_win)
    if _is_full(board):
        return MoveOut(board=board, column=col, status="draw")

    return MoveOut(board=board, column=col, status="in_progress")
