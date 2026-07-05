import enum


class GameKey(str, enum.Enum):
    MATH_GAME = "math_game"
    MEMORY_GAME = "memory_game"
    TIC_TAC_TOE = "tic_tac_toe"
    SNAKE = "snake"
    GAME_2048 = "game_2048"
    WHACK_A_MOLE = "whack_a_mole"
    WORDLE = "wordle"
    HANGMAN = "hangman"
    CONNECT_FOUR = "connect_four"
    ROCK_PAPER_SCISSORS = "rock_paper_scissors"
