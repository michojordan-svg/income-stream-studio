---
name: Backend setup
description: Express backend config quirks on Replit for Income Autopilot
---

# Backend setup

**Port:** 3001, binds 0.0.0.0, returns 200 on GET /health.

**Why no waitForPort:** Replit's workflow port detection fails for port 3001 even when the server is healthy and curl confirms it's up. Removing `waitForPort` from the workflow config makes it track the process instead — the server runs fine.

**Packages:** `npm install` must be run inside `backend/` (not at root). The backend has its own `package.json` and `node_modules/`.

**JWT_SECRET:** Auto-generated 96-char hex string stored as a shared env var via `setEnvVars`. User may override with a real secret in Replit Secrets before deploying.

**How to apply:** When restarting the Backend API workflow after code changes, don't set `waitForPort: 3001` — just use `outputType: "console"`.
