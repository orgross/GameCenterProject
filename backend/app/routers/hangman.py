import random
import time
import uuid
from enum import Enum

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator

router = APIRouter(prefix="/games/hangman", tags=["hangman"])

MAX_WRONG = 6
SESSION_TTL_SECONDS = 15 * 60

WORDS_BY_CATEGORY: dict[str, list[str]] = {
    "animals": ["lion", "tiger", "zebra", "giraffe", "elephant", "penguin", "dolphin", "kangaroo"],
    "countries": ["france", "brazil", "japan", "canada", "egypt", "australia", "germany", "portugal"],
    "food": ["pizza", "sushi", "burger", "pasta", "falafel", "pancake", "waffle", "burrito"],
    "sports": ["soccer", "tennis", "hockey", "boxing", "cycling", "swimming", "baseball", "cricket"],
}


class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


def _length_bucket(word: str) -> Difficulty:
    if len(word) <= 5:
        return Difficulty.EASY
    if len(word) <= 7:
        return Difficulty.MEDIUM
    return Difficulty.HARD


_WORDS_BY_DIFFICULTY: dict[Difficulty, list[tuple[str, str]]] = {level: [] for level in Difficulty}
for _category, _words in WORDS_BY_CATEGORY.items():
    for _word in _words:
        _WORDS_BY_DIFFICULTY[_length_bucket(_word)].append((_word, _category))

# game_id -> (word, category, guessed_letters, wrong_count, created_at)
_sessions: dict[str, tuple[str, str, set[str], int, float]] = {}


class NewGameOut(BaseModel):
    game_id: str
    word_length: int
    category: str
    max_wrong: int


class GuessIn(BaseModel):
    game_id: str
    letter: str

    @field_validator("letter")
    @classmethod
    def normalize(cls, value: str) -> str:
        value = value.strip().lower()
        if len(value) != 1 or not value.isalpha():
            raise ValueError("letter must be a single alphabetic character")
        return value


class GuessOut(BaseModel):
    pattern: list[str]
    wrong_guesses: int
    max_wrong: int
    guessed_letters: list[str]
    status: str  # "in_progress" | "won" | "lost"
    word: str | None = None


def _purge_expired() -> None:
    now = time.time()
    expired = [gid for gid, session in _sessions.items() if now - session[4] > SESSION_TTL_SECONDS]
    for gid in expired:
        _sessions.pop(gid, None)


def _pattern_for(word: str, guessed: set[str]) -> list[str]:
    return [ch if ch in guessed else "_" for ch in word]


@router.post("/new", response_model=NewGameOut)
def new_game(difficulty: Difficulty = Difficulty.EASY):
    _purge_expired()
    word, category = random.choice(_WORDS_BY_DIFFICULTY[difficulty])
    game_id = uuid.uuid4().hex
    _sessions[game_id] = (word, category, set(), 0, time.time())
    return NewGameOut(game_id=game_id, word_length=len(word), category=category, max_wrong=MAX_WRONG)


@router.post("/guess", response_model=GuessOut)
def guess(payload: GuessIn):
    session = _sessions.get(payload.game_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Game not found or expired")

    word, category, guessed, wrong_count, created_at = session

    if payload.letter not in guessed:
        guessed = {*guessed, payload.letter}
        if payload.letter not in word:
            wrong_count += 1

    won = all(ch in guessed for ch in word)
    lost = wrong_count >= MAX_WRONG
    status = "won" if won else "lost" if lost else "in_progress"

    if status == "in_progress":
        _sessions[payload.game_id] = (word, category, guessed, wrong_count, created_at)
    else:
        _sessions.pop(payload.game_id, None)

    return GuessOut(
        pattern=_pattern_for(word, guessed),
        wrong_guesses=wrong_count,
        max_wrong=MAX_WRONG,
        guessed_letters=sorted(guessed),
        status=status,
        word=word if status != "in_progress" else None,
    )
