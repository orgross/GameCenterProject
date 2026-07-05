from pydantic import BaseModel, Field

from .game_keys import GameKey


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=4, max_length=100)


class UserOut(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class ScoreSubmit(BaseModel):
    score: int = Field(ge=0)


class MyScore(BaseModel):
    game_key: GameKey
    best_score: int


class LeaderboardEntry(BaseModel):
    game_key: GameKey
    best_score: int | None
    holder: str | None
