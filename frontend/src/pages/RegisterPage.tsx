import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, friendlyAuthError } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username.trim().length < 3) {
      setError(t("auth.usernameTooShort"));
      return;
    }
    if (password.length < 4) {
      setError(t("auth.passwordTooShort"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    setBusy(true);
    try {
      await register(username, password);
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
        <h1 className="text-2xl font-bold mb-6 text-center">{t("auth.registerTitle")}</h1>

        <label className="block text-sm mb-1 text-white/70">{t("auth.username")}</label>
        <input
          className="w-full mb-4 rounded-md bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-violet-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          required
        />

        <label className="block text-sm mb-1 text-white/70">{t("auth.password")}</label>
        <input
          type="password"
          className="w-full mb-4 rounded-md bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-violet-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="block text-sm mb-1 text-white/70">{t("auth.confirmPassword")}</label>
        <input
          type="password"
          className="w-full mb-6 rounded-md bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-violet-400"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-violet-600 py-2 font-medium hover:bg-violet-500 transition-colors disabled:opacity-50"
        >
          {busy ? t("auth.creatingAccount") : t("auth.register")}
        </button>

        <p className="mt-4 text-sm text-center text-white/60">
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="text-violet-300 hover:underline">
            {t("auth.login")}
          </Link>
        </p>
      </form>
    </div>
  );
}
