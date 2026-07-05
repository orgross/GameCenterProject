import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { submitScore } from "../../api/scores";

const GRID_SIZE = 20;
const INITIAL_SPEED_MS = 160;
const MIN_SPEED_MS = 70;
const SPEED_STEP_MS = 4;

type Point = { x: number; y: number };
type Direction = "up" | "down" | "left" | "right";

const OPPOSITE: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const KEY_TO_DIR: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

function randomEmptyCell(snake: Point[]): Point {
  let cell: Point;
  do {
    cell = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
  } while (snake.some((s) => s.x === cell.x && s.y === cell.y));
  return cell;
}

export function Snake() {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>("right");
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);

  const directionRef = useRef(direction);
  const nextDirectionRef = useRef(direction);
  directionRef.current = direction;

  const score = (snake.length - 1) * 10;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const dir = KEY_TO_DIR[e.key];
      if (!dir) return;
      e.preventDefault();
      if (!started && !gameOver) setStarted(true);
      if (dir !== OPPOSITE[directionRef.current]) {
        nextDirectionRef.current = dir;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [started, gameOver]);

  useEffect(() => {
    if (!started || gameOver) return;

    const speed = Math.max(MIN_SPEED_MS, INITIAL_SPEED_MS - snake.length * SPEED_STEP_MS);
    const timer = setTimeout(() => {
      const dir = nextDirectionRef.current;
      setDirection(dir);

      const head = snake[0];
      const delta = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }[dir];
      const newHead = { x: head.x + delta.x, y: head.y + delta.y };

      const hitsWall = newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE;
      const hitsSelf = snake.some((s) => s.x === newHead.x && s.y === newHead.y);

      if (hitsWall || hitsSelf) {
        setGameOver(true);
        submitScore("snake", score)
          .then((result) => setBestScore(result.best_score))
          .catch(() => {});
        return;
      }

      const ateFood = newHead.x === food.x && newHead.y === food.y;
      const newSnake = [newHead, ...snake];
      if (ateFood) {
        setFood(randomEmptyCell(newSnake));
      } else {
        newSnake.pop();
      }
      setSnake(newSnake);
    }, speed);

    return () => clearTimeout(timer);
  }, [snake, started, gameOver, food, score]);

  const restart = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 5, y: 5 });
    setDirection("right");
    nextDirectionRef.current = "right";
    setStarted(false);
    setGameOver(false);
    setBestScore(null);
  };

  const snakeSet = new Set(snake.map((s) => `${s.x},${s.y}`));

  return (
    <div className="flex flex-col items-center px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">🐍 Snake</h1>
      <p className="text-white/60 mb-6 text-sm">Arrow keys / WASD to move · Score: {score}</p>

      <div
        className="grid border border-white/10 bg-black/30"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          width: "min(90vw, 480px)",
          height: "min(90vw, 480px)",
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isSnake = snakeSet.has(`${x},${y}`);
          const isFood = food.x === x && food.y === y;
          return (
            <div
              key={i}
              className={
                isHead
                  ? "bg-emerald-300"
                  : isSnake
                  ? "bg-emerald-500"
                  : isFood
                  ? "bg-rose-400 rounded-full"
                  : "bg-white/5"
              }
            />
          );
        })}
      </div>

      {!started && !gameOver && (
        <p className="mt-6 text-white/60 text-sm">Press an arrow key to start</p>
      )}

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
          <h2 className="text-xl font-bold mb-2">💀 Game over!</h2>
          <p className="text-white/70 mb-1">Final score: {score}</p>
          {bestScore !== null && <p className="text-violet-300">Your best on this game: {bestScore}</p>}
        </div>
      )}
    </div>
  );
}
