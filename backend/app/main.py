from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import Base, engine
from .routers import auth, connect_four, hangman, math_game, rps, scores, tictactoe, wordle

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Game Center API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(scores.router)
app.include_router(math_game.router)
app.include_router(tictactoe.router)
app.include_router(wordle.router)
app.include_router(hangman.router)
app.include_router(connect_four.router)
app.include_router(rps.router)


@app.get("/health")
def health():
    return {"status": "ok"}
