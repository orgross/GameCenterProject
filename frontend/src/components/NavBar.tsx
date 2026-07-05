import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export function NavBar() {
  const { username, logout } = useAuth();
  const { t, language, toggleLanguage, locked } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-y-2 px-4 sm:px-8 py-3 sm:py-4 border-b border-white/10">
      <Link to="/" className="text-lg sm:text-2xl font-bold tracking-tight text-white whitespace-nowrap">
        🎮 {t("nav.brand")}
      </Link>
      <nav className="flex flex-wrap items-center gap-2 sm:gap-6 text-xs sm:text-sm">
        {username ? (
          <>
            <Link to="/" className="hover:text-violet-300 transition-colors">
              {t("nav.games")}
            </Link>
            <Link to="/scores" className="hover:text-violet-300 transition-colors">
              {t("nav.scores")}
            </Link>
            <span className="hidden sm:inline text-violet-300 font-medium">{t("nav.hi", { name: username })}</span>
            <button
              onClick={handleLogout}
              className="rounded-md bg-white/10 px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-white/20 transition-colors"
            >
              {t("nav.logout")}
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-violet-300 transition-colors">
              {t("nav.login")}
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-violet-600 px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-violet-500 transition-colors"
            >
              {t("nav.register")}
            </Link>
          </>
        )}
        <button
          onClick={toggleLanguage}
          disabled={locked}
          className="rounded-md bg-white/10 px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-white/20 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/10"
          title={locked ? t("common.languageLockedTooltip") : language === "en" ? "עברית" : "English"}
        >
          {language === "en" ? "עברית" : "EN"}
        </button>
      </nav>
    </header>
  );
}
