// Token management — stored in localStorage for persistence across page refreshes.
// All methods are SSR-safe: they return null/false when window is not available.
const KEY      = "ia_token";
const USER_KEY = "ia_user";

const isClient = typeof window !== "undefined";

export const auth = {
  getToken: (): string | null =>
    isClient ? localStorage.getItem(KEY) : null,

  setToken: (token: string) => {
    if (isClient) localStorage.setItem(KEY, token);
  },

  removeToken: () => {
    if (!isClient) return;
    localStorage.removeItem(KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated: (): boolean =>
    isClient ? !!localStorage.getItem(KEY) : false,

  getUser: (): { id: string; email: string; username: string } | null => {
    if (!isClient) return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: { id: string; email: string; username: string }) => {
    if (isClient) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
};
