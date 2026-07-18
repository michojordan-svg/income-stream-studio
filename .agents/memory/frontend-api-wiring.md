---
name: Frontend API wiring
description: How the React frontend connects to the Express backend
---

# Frontend API wiring

**API client:** `src/lib/api.ts` — typed fetch wrapper, auto-attaches JWT from localStorage, redirects to `/` on 401.

**Auth storage:** `src/lib/auth.ts` — `auth.getToken()`, `auth.setToken()`, `auth.getUser()`, `auth.setUser()`, `auth.removeToken()`. Token key: `ia_token`, user key: `ia_user`.

**TanStack Query hooks:** `src/hooks/useApi.ts` — one hook per resource (useDashboard, useContent, useLinks, useProducts, usePlatformConnections, useSettings, useMe). QueryClient is provided by `__root.tsx` via context.

**Graceful fallback pattern:** Every route imports static data from `src/lib/dashboard-data.ts` and falls back to it when the API returns empty arrays. This keeps the UI non-empty during first login (no data yet) and on network errors.

**Backend URL:** `import.meta.env.VITE_API_URL ?? "http://localhost:3001"`. Set `VITE_API_URL` in production to the deployed backend URL.

**Auth guard:** `_app.tsx` redirects to `/` if `auth.isAuthenticated()` returns false. Sign-out clears localStorage and navigates to `/`.

**How to apply:** When adding new routes, import hooks from `src/hooks/useApi.ts` and add fallback data from `dashboard-data.ts` for the empty/loading state.
