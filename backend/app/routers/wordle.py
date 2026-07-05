import random
import time
import uuid
from enum import Enum

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator

router = APIRouter(prefix="/games/wordle", tags=["wordle"])

MAX_ATTEMPTS = 6
SESSION_TTL_SECONDS = 15 * 60

WORDS = [
    "apple", "brave", "crane", "delta", "eagle", "flame", "grape", "house",
    "input", "joker", "knife", "lemon", "mango", "night", "ocean", "piano",
    "queen", "river", "stone", "table", "unity", "vivid", "water", "xenon",
    "yield", "zebra", "album", "bench", "chair", "dance", "email", "fable",
    "ghost", "happy", "image", "jelly", "koala", "laser", "mount", "noble",
    "olive", "pearl", "quilt", "robot", "smile", "trust", "urban", "vocal",
    "world", "young", "amber", "bloom", "cloud", "dream", "earth", "frost",
    "glory", "heart", "ivory", "jumbo", "karma", "light", "magic", "north",
    "orbit", "pride", "quick", "raven", "solar", "tiger", "umbra", "vapor",
    "whale", "xerox", "yacht", "zonal", "arena", "brick", "charm", "drift",
    "elbow", "fjord", "grain", "hover", "index", "jazzy", "kiosk", "lunar",
    "moist", "nudge", "opera", "plaza", "quart", "reign", "swift", "trace",
    "unzip", "vigor", "wrist", "yummy", "zesty",
]

# game_id -> (word, attempts_used, created_at)
_sessions: dict[str, tuple[str, int, float]] = {}


class NewGameOut(BaseModel):
    game_id: str
    word_length: int
    max_attempts: int


class GuessIn(BaseModel):
    game_id: str
    guess: str

    @field_validator("guess")
    @classmethod
    def normalize(cls, value: str) -> str:
        value = value.strip().lower()
        if len(value) != 5 or not value.isalpha():
            raise ValueError("guess must be a 5-letter word")
        return value


class LetterStatus(BaseModel):
    letter: str
    status: str  # "correct" | "present" | "absent"


class GuessOut(BaseModel):
    result: list[LetterStatus]
    attempts_used: int
    attempts_remaining: int
    solved: bool
    game_over: bool
    word: str | None = None


def _purge_expired() -> None:
    now = time.time()
    expired = [gid for gid, (_, _, created) in _sessions.items() if now - created > SESSION_TTL_SECONDS]
    for gid in expired:
        _sessions.pop(gid, None)


def _score_guess(guess: str, answer: str) -> list[LetterStatus]:
    result = ["absent"] * 5
    answer_letters = list(answer)

    for i in range(5):
        if guess[i] == answer[i]:
            result[i] = "correct"
            answer_letters[i] = None

    for i in range(5):
        if result[i] == "correct":
            continue
        if guess[i] in answer_letters:
            result[i] = "present"
            answer_letters[answer_letters.index(guess[i])] = None

    return [LetterStatus(letter=guess[i], status=result[i]) for i in range(5)]


@router.post("/new", response_model=NewGameOut)
def new_game():
    _purge_expired()
    word = random.choice(WORDS)
    game_id = uuid.uuid4().hex
    _sessions[game_id] = (word, 0, time.time())
    return NewGameOut(game_id=game_id, word_length=len(word), max_attempts=MAX_ATTEMPTS)


@router.post("/guess", response_model=GuessOut)
def guess(payload: GuessIn):
    session = _sessions.get(payload.game_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Game not found or expired")

    word, attempts_used, created_at = session
    attempts_used += 1
    result = _score_guess(payload.guess, word)
    solved = payload.guess == word
    game_over = solved or attempts_used >= MAX_ATTEMPTS

    if game_over:
        _sessions.pop(payload.game_id, None)
    else:
        _sessions[payload.game_id] = (word, attempts_used, created_at)

    return GuessOut(
        result=result,
        attempts_used=attempts_used,
        attempts_remaining=MAX_ATTEMPTS - attempts_used,
        solved=solved,
        game_over=game_over,
        word=word if game_over else None,
    )
