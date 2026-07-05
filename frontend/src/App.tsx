import { Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { HomePage } from "./pages/HomePage";
import { ScoresPage } from "./pages/ScoresPage";
import { MathGame } from "./games/MathGame/MathGame";
import { MemoryGame } from "./games/MemoryGame/MemoryGame";
import { TicTacToe } from "./games/TicTacToe/TicTacToe";
import { Snake } from "./games/Snake/Snake";
import { Game2048 } from "./games/Game2048/Game2048";
import { WhackAMole } from "./games/WhackAMole/WhackAMole";
import { Wordle } from "./games/Wordle/Wordle";
import { Hangman } from "./games/Hangman/Hangman";
import { ConnectFour } from "./games/ConnectFour/ConnectFour";
import { RockPaperScissors } from "./games/RockPaperScissors/RockPaperScissors";

function App() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scores"
          element={
            <ProtectedRoute>
              <ScoresPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/math"
          element={
            <ProtectedRoute>
              <MathGame />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/memory"
          element={
            <ProtectedRoute>
              <MemoryGame />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/tictactoe"
          element={
            <ProtectedRoute>
              <TicTacToe />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/snake"
          element={
            <ProtectedRoute>
              <Snake />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/2048"
          element={
            <ProtectedRoute>
              <Game2048 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/whack-a-mole"
          element={
            <ProtectedRoute>
              <WhackAMole />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/wordle"
          element={
            <ProtectedRoute>
              <Wordle />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/hangman"
          element={
            <ProtectedRoute>
              <Hangman />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/connect-four"
          element={
            <ProtectedRoute>
              <ConnectFour />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/rock-paper-scissors"
          element={
            <ProtectedRoute>
              <RockPaperScissors />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
