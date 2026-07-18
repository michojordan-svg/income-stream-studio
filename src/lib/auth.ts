// Token management — stored in localStorage for persistence across page refreshes.
const KEY = "ia_token";
const USER_KEY = "ia_user";

export const auth = {
  getToken: (): string | null => localStorage.getItem(KEY),

  setToken: (token: string) => localStorage.setItem(KEY, token),

  removeToken: () => {
    localStorage.removeItem(KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated: (): boolean => !!localStorage.getItem(KEY),

  getUser: (): { id: string; email: string; username: string } | null => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: { id: string; email: string; username: string }) =>
    localStorage.setItem(USER_KEY, JSON.stringify(user)),
};
