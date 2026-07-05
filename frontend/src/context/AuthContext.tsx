import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { apiPostForm, apiPostJson, ApiError } from "../api/client";
import type { TokenResponse } from "../api/types";

const TOKEN_KEY = "gamecenter_token";
const USERNAME_KEY = "gamecenter_username";

interface AuthContextValue {
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function persistSession(token: TokenResponse) {
  localStorage.setItem(TOKEN_KEY, token.access_token);
  localStorage.setItem(USERNAME_KEY, token.username);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(
    () => localStorage.getItem(USERNAME_KEY)
  );

  const login = async (usernameInput: string, password: string) => {
    const token = await apiPostForm<TokenResponse>("/auth/login", {
      username: usernameInput,
      password,
    });
    persistSession(token);
    setUsername(token.username);
  };

  const register = async (usernameInput: string, password: string) => {
    const token = await apiPostJson<TokenResponse>("/auth/register", {
      username: usernameInput,
      password,
    });
    persistSession(token);
    setUsername(token.username);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    setUsername(null);
  };

  const value = useMemo(() => ({ username, login, register, logout }), [username]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export function friendlyAuthError(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return "Something went wrong. Please try again.";
}
