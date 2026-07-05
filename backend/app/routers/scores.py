from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas, security
from ..database import get_db
from ..game_keys import GameKey

router = APIRouter(prefix="/scores", tags=["scores"])

ALL_GAMES = list(GameKey)


@router.post("/{game_key}", response_model=schemas.MyScore)
def submit_score(
    game_key: GameKey,
    payload: schemas.ScoreSubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    row = (
        db.query(models.Score)
        .filter(models.Score.user_id == current_user.id, models.Score.game_key == game_key.value)
        .first()
    )
    if row is None:
        row = models.Score(user_id=current_user.id, game_key=game_key.value, best_score=payload.score)
        db.add(row)
    elif payload.score > row.best_score:
        row.best_score = payload.score

    db.commit()
    db.refresh(row)
    return schemas.MyScore(game_key=game_key, best_score=row.best_score)


@router.get("/me", response_model=list[schemas.MyScore])
def my_scores(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    rows = {row.game_key: row.best_score for row in current_user.scores}
    return [schemas.MyScore(game_key=key, best_score=rows.get(key.value, 0)) for key in ALL_GAMES]


@router.get("/leaderboard", response_model=list[schemas.LeaderboardEntry])
def leaderboard(db: Session = Depends(get_db)):
    entries: list[schemas.LeaderboardEntry] = []
    for key in ALL_GAMES:
        top = (
            db.query(models.Score, models.User)
            .join(models.User, models.Score.user_id == models.User.id)
            .filter(models.Score.game_key == key.value)
            .order_by(models.Score.best_score.desc())
            .first()
        )
        if top is None:
            entries.append(schemas.LeaderboardEntry(game_key=key, best_score=None, holder=None))
        else:
            score_row, user_row = top
            entries.append(
                schemas.LeaderboardEntry(game_key=key, best_score=score_row.best_score, holder=user_row.username)
            )
    return entries
