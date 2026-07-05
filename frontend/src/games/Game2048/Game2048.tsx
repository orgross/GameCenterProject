import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { submitScore } from "../../api/scores";

const SIZE = 4;
type Grid = number[][];

function emptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

function emptyCells(grid: Grid): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) cells.push([r, c]);
    }
  }
  return cells;
}

function spawnTile(grid: Grid): Grid {
  const cells = emptyCells(grid);
  if (cells.length === 0) return grid;
  const [r, c] = cells[Math.floor(Math.random() * cells.length)];
  const next = cloneGrid(grid);
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

/** Slides + merges a single row to the left. Returns the new row and points gained. */
function slideRowLeft(row: number[]): { row: number[]; gained: number } {
  const values = row.filter((v) => v !== 0);
  const result: number[] = [];
  let gained = 0;

  let i = 0;
  while (i < values.length) {
    if (i + 1 < values.length && values[i] === values[i + 1]) {
      const merged = values[i] * 2;
      result.push(merged);
      gained += merged;
      i += 2;
    } else {
      result.push(values[i]);
      i += 1;
    }
  }

  while (result.length < SIZE) result.push(0);
  return { row: result, gained };
}

function transpose(grid: Grid): Grid {
  return grid[0].map((_, c) => grid.map((row) => row[c]));
}

function reverseRows(grid: Grid): Grid {
  return grid.map((row) => [...row].reverse());
}

type Direction = "left" | "right" | "up" | "down";

function move(grid: Grid, direction: Direction): { grid: Grid; gained: number; moved: boolean } {
  let working = cloneGrid(grid);
  if (direction === "up") working = transpose(working);
  if (direction === "down") working = reverseRows(transpose(working));
  if (direction === "right") working = reverseRows(working);

  let gained = 0;
  const slid = working.map((row) => {
    const { row: newRow, gained: rowGained } = slideRowLeft(row);
    gained += rowGained;
    return newRow;
  });

  let result = slid;
  if (direction === "up") result = transpose(slid);
  if (direction === "down") result = transpose(reverseRows(slid));
  if (direction === "right") result = reverseRows(slid);

  const moved = JSON.stringify(result) !== JSON.stringify(grid);
  return { grid: result, gained, moved };
}

function canMove(grid: Grid): boolean {
  if (emptyCells(grid).length > 0) return true;
  for (const dir of ["left", "right", "up", "down"] as Direction[]) {
    if (move(grid, dir).moved) return true;
  }
  return false;
}

const KEY_TO_DIR: Record<string, Direction> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  a: "left",
  d: "right",
  w: "up",
  s: "down",
};

const TILE_COLORS: Record<number, string> = {
  2: "bg-slate-200 text-slate-900",
  4: "bg-slate-300 text-slate-900",
  8: "bg-orange-300 text-slate-900",
  16: "bg-orange-400 text-white",
  32: "bg-orange-500 text-white",
  64: "bg-orange-600 text-white",
  128: "bg-amber-400 text-white",
  256: "bg-amber-500 text-white",
  512: "bg-amber-600 text-white",
  1024: "bg-yellow-400 text-white",
  2048: "bg-yellow-500 text-white",
};

function initialGrid(): Grid {
  return spawnTile(spawnTile(emptyGrid()));
}

export function Game2048() {
  const [grid, setGrid] = useState<Grid>(() => initialGrid());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const dir = KEY_TO_DIR[e.key];
      if (!dir || gameOver) return;
      e.preventDefault();

      setGrid((current) => {
        const { grid: next, gained, moved } = move(current, dir);
        if (!moved) return current;

        const spawned = spawnTile(next);
        setScore((s) => s + gained);

        if (!canMove(spawned)) {
          setGameOver(true);
          submitScore("game_2048", score + gained)
            .then((result) => setBestScore(result.best_score))
            .catch(() => {});
        }

        return spawned;
      });
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver, score]);

  const restart = () => {
    setGrid(initialGrid());
    setScore(0);
    setGameOver(false);
    setBestScore(null);
  };

  return (
    <div className="flex flex-col items-center px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">🔢 2048</h1>
      <p className="text-white/60 mb-6 text-sm">Arrow keys / WASD to slide · Score: {score}</p>

      <div className="grid grid-cols-4 gap-2 p-2 rounded-xl bg-black/30 border border-white/10">
        {grid.flat().map((value, i) => (
          <div
            key={i}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center text-xl font-bold transition-colors ${
              value === 0 ? "bg-white/5" : TILE_COLORS[value] ?? "bg-violet-700 text-white"
            }`}
          >
            {value !== 0 && value}
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={restart}
          className="rounded-md bg-violet-600 px-4 py-2 font-medium hover:bg-violet-500 transition-colors"
        >
          Restart
        </button>
        <Link to="/" className="rounded-md bg-white/10 px-4 py-2 font-medium hover:bg-white/20 transition-colors">
          ← Back
        </Link>
      </div>

      {gameOver && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center max-w-sm">
          <h2 className="text-xl font-bold mb-2">🧱 No more moves!</h2>
          <p className="text-white/70 mb-1">Final score: {score}</p>
          {bestScore !== null && <p className="text-violet-300">Your best on this game: {bestScore}</p>}
        </div>
      )}
    </div>
  );
}
