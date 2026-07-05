import { Link } from "react-router-dom";

const GAMES = [
  {
    to: "/games/math",
    icon: "🧮",
    title: "Math Game",
    description: "Race against a score goal solving arithmetic problems. Build a streak for bonus points.",
  },
  {
    to: "/games/memory",
    icon: "🧠",
    title: "Memory Game",
    description: "Flip cards to find matching pairs. Fewer moves and less time means a higher score.",
  },
  {
    to: "/games/tictactoe",
    icon: "❌⭕",
    title: "Tic-Tac-Toe",
    description: "Face off against the computer, or a friend on this computer. Win fast for the highest score.",
  },
  {
    to: "/games/snake",
    icon: "🐍",
    title: "Snake",
    description: "Classic arcade snake. Eat food to grow — and speed up. Score = food eaten.",
  },
  {
    to: "/games/2048",
    icon: "🔢",
    title: "2048",
    description: "Slide and merge tiles to reach 2048 and beyond. Score = sum of merged tiles.",
  },
  {
    to: "/games/whack-a-mole",
    icon: "🔨",
    title: "Whack-a-Mole",
    description: "30 seconds to whack as many moles as you can before they duck back down.",
  },
  {
    to: "/games/wordle",
    icon: "🟩",
    title: "Wordle",
    description: "Guess the 5-letter word in 6 tries. Fewer guesses means a higher score.",
  },
  {
    to: "/games/hangman",
    icon: "🎩",
    title: "Hangman",
    description: "Guess the hidden word one letter at a time before you run out of guesses.",
  },
  {
    to: "/games/connect-four",
    icon: "🔴",
    title: "Connect Four",
    description: "Drop pieces to connect four in a row against a real minimax AI, or a friend on this computer.",
  },
  {
    to: "/games/rock-paper-scissors",
    icon: "✊",
    title: "Rock-Paper-Scissors",
    description: "Best of 5 against an AI that learns your patterns, or pass-and-play with a friend.",
  },
];

export function HomePage() {
  return (
    <div className="px-8 py-12 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-2">Pick a game</h1>
      <p className="text-white/60 text-center mb-10">
        Your best scores are saved automatically and ranked against every player.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {GAMES.map((game) => (
          <Link
            key={game.to}
            to={game.to}
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 hover:border-violet-400/50 transition-all"
          >
            <div className="text-4xl mb-4">{game.icon}</div>
            <h2 className="text-xl font-semibold mb-2 group-hover:text-violet-300 transition-colors">
              {game.title}
            </h2>
            <p className="text-sm text-white/60">{game.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
