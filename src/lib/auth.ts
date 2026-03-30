export interface StoredUser {
  id: number;
  username: string;
  email: string;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pp_token");
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("pp_user");
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function saveAuth(token: string, user: StoredUser) {
  localStorage.setItem("pp_token", token);
  localStorage.setItem("pp_user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("pp_token");
  localStorage.removeItem("pp_user");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
