import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, friendlyAuthError } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex justify-center items-center px-4 py-20">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Log in</h1>

        <label className="block text-sm mb-1 text-white/70">Username</label>
        <input
          className="w-full mb-4 rounded-md bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-violet-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          required
        />

        <label className="block text-sm mb-1 text-white/70">Password</label>
        <input
          type="password"
          className="w-full mb-6 rounded-md bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-violet-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-violet-600 py-2 font-medium hover:bg-violet-500 transition-colors disabled:opacity-50"
        >
          {busy ? "Logging in..." : "Log in"}
        </button>

        <p className="mt-4 text-sm text-center text-white/60">
          No account?{" "}
          <Link to="/register" className="text-violet-300 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
