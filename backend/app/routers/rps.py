import random
import time
import uuid
from enum import Enum

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/games/rps", tags=["rock-paper-scissors"])

SESSION_TTL_SECONDS = 15 * 60
WINS_NEEDED = 3


class Move(str, Enum):
    ROCK = "rock"
    PAPER = "paper"
    SCISSORS = "scissors"


MOVES = list(Move)
# BEATS[a] = move that 'a' beats
BEATS = {Move.ROCK: Move.SCISSORS, Move.PAPER: Move.ROCK, Move.SCISSORS: Move.PAPER}
# COUNTER[a] = move that beats 'a'
COUNTER = {Move.SCISSORS: Move.ROCK, Move.ROCK: Move.PAPER, Move.PAPER: Move.SCISSORS}


class Session(BaseModel):
    history: list[Move] = []
    human_wins: int = 0
    ai_wins: int = 0


# game_id -> (session, created_at)
_sessions: dict[str, tuple[Session, float]] = {}


class NewGameOut(BaseModel):
    game_id: str
    wins_needed: int


class PlayIn(BaseModel):
    game_id: str
    move: Move


class PlayOut(BaseModel):
    human_move: Move
    ai_move: Move
    result: str  # "human_win" | "ai_win" | "draw"
    human_wins: int
    ai_wins: int
    match_over: bool
    match_winner: str | None = None


def _purge_expired() -> None:
    now = time.time()
    expired = [gid for gid, (_, created) in _sessions.items() if now - created > SESSION_TTL_SECONDS]
    for gid in expired:
        _sessions.pop(gid, None)


def _predict_next(history: list[Move]) -> Move:
    """Order-1 Markov chain: given the human's last move, predict what usually follows it."""
    if len(history) < 2:
        return random.choice(MOVES)

    last = history[-1]
    counts = {m: 0 for m in MOVES}
    for i in range(len(history) - 1):
        if history[i] == last:
            counts[history[i + 1]] += 1

    if sum(counts.values()) == 0:
        return random.choice(MOVES)
    return max(counts, key=lambda m: counts[m])


@router.post("/new", response_model=NewGameOut)
def new_game():
    _purge_expired()
    game_id = uuid.uuid4().hex
    _sessions[game_id] = (Session(), time.time())
    return NewGameOut(game_id=game_id, wins_needed=WINS_NEEDED)


@router.post("/play", response_model=PlayOut)
def play(payload: PlayIn):
    entry = _sessions.get(payload.game_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Game not found or expired")
    session, created_at = entry

    predicted_human_move = _predict_next(session.history)
    ai_move = COUNTER[predicted_human_move]
    human_move = payload.move

    if human_move == ai_move:
        result = "draw"
    elif BEATS[human_move] == ai_move:
        result = "human_win"
        session.human_wins += 1
    else:
        result = "ai_win"
        session.ai_wins += 1

    session.history.append(human_move)

    match_over = session.human_wins >= WINS_NEEDED or session.ai_wins >= WINS_NEEDED
    match_winner = None
    if match_over:
        match_winner = "human" if session.human_wins > session.ai_wins else "ai"
        _sessions.pop(payload.game_id, None)
    else:
        _sessions[payload.game_id] = (session, created_at)

    return PlayOut(
        human_move=human_move,
        ai_move=ai_move,
        result=result,
        human_wins=session.human_wins,
        ai_wins=session.ai_wins,
        match_over=match_over,
        match_winner=match_winner,
    )
