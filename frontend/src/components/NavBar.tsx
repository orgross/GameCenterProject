import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function NavBar() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-white/10">
      <Link to="/" className="text-2xl font-bold tracking-tight text-white">
        🎮 Game Center
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        {username ? (
          <>
            <Link to="/" className="hover:text-violet-300 transition-colors">
              Games
            </Link>
            <Link to="/scores" className="hover:text-violet-300 transition-colors">
              Scores
            </Link>
            <span className="text-violet-300 font-medium">Hi, {username}</span>
            <button
              onClick={handleLogout}
              className="rounded-md bg-white/10 px-3 py-1.5 hover:bg-white/20 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-violet-300 transition-colors">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-violet-600 px-3 py-1.5 hover:bg-violet-500 transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
