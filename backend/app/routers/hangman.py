import random
import time
import uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator

router = APIRouter(prefix="/games/hangman", tags=["hangman"])

MAX_WRONG = 6
SESSION_TTL_SECONDS = 15 * 60
RANDOM_CATEGORY = "random"

# Hebrew final-letter forms map to their base letter for guessing purposes —
# a player guesses the base letter once and it matches both spellings.
FINAL_TO_BASE = {"ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ"}


def _canon(ch: str) -> str:
    return FINAL_TO_BASE.get(ch, ch)


WORDS_BY_CATEGORY_EN: dict[str, list[str]] = {
    "food_and_drinks": [
        "pizza", "sushi", "burger", "pasta", "coffee", "sandwich", "chocolate",
        "pancake", "popcorn", "lemonade", "spaghetti", "avocado", "croissant",
        "smoothie", "burrito", "waffle", "noodles",
    ],
    "sports": [
        "soccer", "tennis", "hockey", "boxing", "cycling", "swimming", "baseball",
        "cricket", "rugby", "golf", "volleyball", "badminton", "wrestling",
        "skiing", "surfing", "bowling", "archery",
    ],
    "famous_people": [
        "einstein", "shakespeare", "beethoven", "cleopatra", "gandhi", "picasso",
        "mozart", "newton", "darwin", "napoleon", "tesla", "curie", "lincoln",
        "mandela", "aristotle", "freud", "chaplin",
    ],
    "musical_instruments": [
        "guitar", "piano", "violin", "trumpet", "flute", "drums", "cello",
        "saxophone", "clarinet", "harp", "trombone", "banjo", "ukulele",
        "accordion", "xylophone", "tambourine", "harmonica",
    ],
    "jobs_and_professions": [
        "doctor", "teacher", "lawyer", "engineer", "plumber", "dentist", "chef",
        "pilot", "farmer", "nurse", "architect", "electrician", "mechanic",
        "journalist", "scientist", "firefighter", "veterinarian",
    ],
    "space_and_planets": [
        "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus",
        "neptune", "galaxy", "asteroid", "comet", "meteor", "nebula",
        "satellite", "telescope", "astronaut", "spacecraft",
    ],
    "video_games": [
        "minecraft", "fortnite", "tetris", "pacman", "zelda", "pokemon", "mario",
        "sonic", "doom", "halo", "portal", "skyrim", "overwatch", "warcraft",
        "starcraft", "tekken", "minesweeper",
    ],
}

WORDS_BY_CATEGORY_HE: dict[str, list[str]] = {
    "food_and_drinks": [
        "פיצה", "סושי", "המבורגר", "פסטה", "קפה", "כריך", "שוקולד", "פנקייק",
        "פופקורן", "לימונדה", "ספגטי", "אבוקדו", "קרואסון", "חלב", "מרק",
        "סלט", "גלידה",
    ],
    "sports": [
        "כדורגל", "טניס", "הוקי", "אגרוף", "רכיבה", "שחייה", "בייסבול",
        "קריקט", "רוגבי", "גולף", "כדורעף", "בדמינטון", "היאבקות", "סקי",
        "גלישה", "באולינג", "קשתות",
    ],
    "famous_people": [
        "איינשטיין", "שייקספיר", "בטהובן", "קלאופטרה", "גנדי", "פיקאסו",
        "מוצרט", "ניוטון", "דרווין", "נפוליאון", "טסלה", "קירי", "לינקולן",
        "מנדלה", "אריסטו", "פרויד", "רמברנדט",
    ],
    "musical_instruments": [
        "גיטרה", "פסנתר", "כינור", "חצוצרה", "חליל", "תופים", "אורגן",
        "סקסופון", "קלרינט", "נבל", "טרומבון", "יוקללי", "אקורדיון",
        "קסילופון", "מנדולינה", "חלילית", "מפוחית",
    ],
    "jobs_and_professions": [
        "רופא", "מורה", "פרקליט", "מהנדס", "שרברב", "טבח", "טייס", "חקלאי",
        "אחות", "אדריכל", "חשמלאי", "מכונאי", "עיתונאי", "מדען", "כבאי",
        "וטרינר", "נגר",
    ],
    "space_and_planets": [
        "נוגה", "מאדים", "צדק", "שבתאי", "אורנוס", "נפטון", "שמש", "ירח",
        "גלקסיה", "אסטרואיד", "שביט", "מטאור", "ערפילית", "לוויין",
        "טלסקופ", "אסטרונאוט", "חללית",
    ],
    "video_games": [
        "מיינקראפט", "פורטנייט", "טטריס", "פקמן", "זלדה", "פוקימון", "מריו",
        "סוניק", "דום", "הילו", "פורטל", "אוברווטש", "וורקראפט",
        "סטארקראפט", "טקן", "פיפא", "סימס",
    ],
}

WORDS_BY_LANGUAGE = {"en": WORDS_BY_CATEGORY_EN, "he": WORDS_BY_CATEGORY_HE}

CATEGORY_LABELS: dict[str, str] = {
    "food_and_drinks": "Food and Drinks",
    "sports": "Sports",
    "famous_people": "Famous People",
    "musical_instruments": "Musical Instruments",
    "jobs_and_professions": "Jobs and Professions",
    "space_and_planets": "Space and Planets",
    "video_games": "Video Games",
}

CATEGORIES = list(WORDS_BY_CATEGORY_EN.keys())

# game_id -> (word, category, guessed_letters (canonical), wrong_count, created_at)
_sessions: dict[str, tuple[str, str, set[str], int, float]] = {}


class CategoryOut(BaseModel):
    key: str
    label: str


class NewGameOut(BaseModel):
    game_id: str
    word_length: int
    category: str
    category_key: str
    max_wrong: int


class GuessIn(BaseModel):
    game_id: str
    letter: str

    @field_validator("letter")
    @classmethod
    def normalize(cls, value: str) -> str:
        value = value.strip()
        if len(value) != 1 or not value.isalpha():
            raise ValueError("letter must be a single alphabetic character")
        return value.lower()


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
    return [ch if _canon(ch) in guessed else "_" for ch in word]


@router.get("/categories", response_model=list[CategoryOut])
def list_categories():
    return [CategoryOut(key=key, label=CATEGORY_LABELS[key]) for key in CATEGORIES]


@router.post("/new", response_model=NewGameOut)
def new_game(category: str = RANDOM_CATEGORY, language: str = "en"):
    _purge_expired()
    words_by_category = WORDS_BY_LANGUAGE.get(language, WORDS_BY_CATEGORY_EN)
    if category not in words_by_category:
        category = random.choice(CATEGORIES)
    word = random.choice(words_by_category[category])
    game_id = uuid.uuid4().hex
    _sessions[game_id] = (word, category, set(), 0, time.time())
    return NewGameOut(
        game_id=game_id,
        word_length=len(word),
        category=CATEGORY_LABELS[category],
        category_key=category,
        max_wrong=MAX_WRONG,
    )


@router.post("/guess", response_model=GuessOut)
def guess(payload: GuessIn):
    session = _sessions.get(payload.game_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Game not found or expired")

    word, category, guessed, wrong_count, created_at = session
    letter = _canon(payload.letter)

    if letter not in guessed:
        guessed = {*guessed, letter}
        if letter not in {_canon(ch) for ch in word}:
            wrong_count += 1

    won = all(_canon(ch) in guessed for ch in word)
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
