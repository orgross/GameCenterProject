import random
from enum import Enum

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator

router = APIRouter(prefix="/games/tictactoe", tags=["tictactoe"])

WIN_LINES = [
    (0, 1, 2), (3, 4, 5), (6, 7, 8),
    (0, 3, 6), (1, 4, 7), (2, 5, 8),
    (0, 4, 8), (2, 4, 6),
]


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
        if len(board) != 9 or any(cell not in ("", "X", "O") for cell in board):
            raise ValueError("board must have 9 cells, each '', 'X' or 'O'")
        return board

    @field_validator("computer_mark")
    @classmethod
    def validate_mark(cls, mark: str) -> str:
        if mark not in ("X", "O"):
            raise ValueError("computer_mark must be 'X' or 'O'")
        return mark


class MoveOut(BaseModel):
    board: list[str]
    move: int | None
    status: str
    winning_line: list[int] | None = None


def _winning_line(board: list[str], mark: str) -> list[int] | None:
    for line in WIN_LINES:
        if all(board[i] == mark for i in line):
            return list(line)
    return None


def _is_full(board: list[str]) -> bool:
    return all(cell != "" for cell in board)


def _best_move(board: list[str], computer_mark: str, human_mark: str, difficulty: Difficulty) -> int:
    empty = [i for i, cell in enumerate(board) if cell == ""]

    if difficulty == Difficulty.EASY and random.random() < 0.6:
        return random.choice(empty)

    for i in empty:
        board[i] = computer_mark
        if _winning_line(board, computer_mark):
            board[i] = ""
            return i
        board[i] = ""

    for i in empty:
        board[i] = human_mark
        if _winning_line(board, human_mark):
            board[i] = ""
            return i
        board[i] = ""

    if 4 in empty:
        return 4

    corners = [i for i in (0, 2, 6, 8) if i in empty]
    if corners:
        return random.choice(corners)

    return random.choice(empty)


@router.post("/move", response_model=MoveOut)
def make_move(payload: MoveIn):
    board = list(payload.board)
    computer_mark = payload.computer_mark
    human_mark = "O" if computer_mark == "X" else "X"

    human_win = _winning_line(board, human_mark)
    if human_win:
        return MoveOut(board=board, move=None, status="human_win", winning_line=human_win)
    if _is_full(board):
        return MoveOut(board=board, move=None, status="draw")

    if not any(cell == "" for cell in board):
        raise HTTPException(status_code=400, detail="Board is already full")

    move = _best_move(board, computer_mark, human_mark, payload.difficulty)
    board[move] = computer_mark

    computer_win = _winning_line(board, computer_mark)
    if computer_win:
        return MoveOut(board=board, move=move, status="computer_win", winning_line=computer_win)
    if _is_full(board):
        return MoveOut(board=board, move=move, status="draw")

    return MoveOut(board=board, move=move, status="in_progress")
