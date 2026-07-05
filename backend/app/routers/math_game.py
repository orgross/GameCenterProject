import random
import time
import uuid
from enum import Enum

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/games/math", tags=["math-game"])

PROBLEM_TTL_SECONDS = 5 * 60
# problem_id -> (answer, created_at)
_pending_problems: dict[str, tuple[int, float]] = {}


class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class ProblemOut(BaseModel):
    problem_id: str
    expression: str
    difficulty: Difficulty


class AnswerIn(BaseModel):
    problem_id: str
    answer: int


class AnswerOut(BaseModel):
    correct: bool
    correct_answer: int


def _purge_expired() -> None:
    now = time.time()
    expired = [pid for pid, (_, created_at) in _pending_problems.items() if now - created_at > PROBLEM_TTL_SECONDS]
    for pid in expired:
        _pending_problems.pop(pid, None)


def _generate_expression(difficulty: Difficulty) -> tuple[str, int]:
    a, b = random.randint(1, 10), random.randint(1, 10)
    if difficulty == Difficulty.EASY:
        return f"{a} + {b}", a + b
    if difficulty == Difficulty.MEDIUM:
        return f"{a} × {b}", a * b
    c = random.randint(1, 10)
    return f"{a} + {b} × {c}", a + (b * c)


@router.get("/problem", response_model=ProblemOut)
def get_problem(difficulty: Difficulty = Difficulty.EASY):
    _purge_expired()
    expression, answer = _generate_expression(difficulty)
    problem_id = uuid.uuid4().hex
    _pending_problems[problem_id] = (answer, time.time())
    return ProblemOut(problem_id=problem_id, expression=expression, difficulty=difficulty)


@router.post("/answer", response_model=AnswerOut)
def submit_answer(payload: AnswerIn):
    entry = _pending_problems.pop(payload.problem_id, None)
    if entry is None:
        raise HTTPException(status_code=404, detail="Problem not found or already answered")
    correct_answer, _ = entry
    return AnswerOut(correct=payload.answer == correct_answer, correct_answer=correct_answer)
