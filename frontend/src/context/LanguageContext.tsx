import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Lang } from "../i18n/translations";

const STORAGE_KEY = "gamecenter_lang";

function getLeaf(lang: Lang, path: string): unknown {
  const parts = path.split(".");
  let node: unknown = translations[lang];
  for (const part of parts) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return node;
}

interface LanguageContextValue {
  language: Lang;
  dir: "ltr" | "rtl";
  setLanguage: (lang: Lang) => void;
  toggleLanguage: () => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
  /** True while a game with language-dependent content (e.g. Hangman) has an active session. */
  locked: boolean;
  setLocked: (locked: boolean) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Lang>(
    () => (localStorage.getItem(STORAGE_KEY) as Lang | null) ?? "en"
  );
  const [locked, setLocked] = useState(false);

  const dir: "ltr" | "rtl" = language === "he" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  const setLanguage = (lang: Lang) => {
    if (locked) return;
    localStorage.setItem(STORAGE_KEY, lang);
    setLanguageState(lang);
  };

  const toggleLanguage = () => setLanguage(language === "en" ? "he" : "en");

  const t = (path: string, vars: Record<string, string | number> = {}): string => {
    const leaf = getLeaf(language, path) ?? getLeaf("en", path);
    if (typeof leaf === "function") return (leaf as (v: typeof vars) => string)(vars);
    if (typeof leaf === "string") return leaf;
    return path;
  };

  const value = useMemo(
    () => ({ language, dir, setLanguage, toggleLanguage, t, locked, setLocked }),
    [language, dir, locked]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
