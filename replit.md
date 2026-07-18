# Income Autopilot

A dashboard app for tracking and automating income streams across Pinterest affiliates, YouTube monetization, and digital products.

---

## Stack

### Frontend
- **Framework**: TanStack Start (React 19 + SSR via Nitro)
- **Router**: TanStack Router (file-based routing in `src/routes/`)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Package manager**: Bun
- **Build tool**: Vite via `@lovable.dev/vite-tanstack-config`

### Backend
- **Runtime**: Node.js 20 (CommonJS)
- **Framework**: Express 4
- **Database**: PostgreSQL (Replit-managed)
- **Auth**: JWT (jsonwebtoken + bcrypt)
- **Scheduler**: node-cron
- **Validation**: Zod

---

## Running the app

Two workflows run automatically:

| Workflow | Command | Port | Purpose |
|---|---|---|---|
| **Start application** | `bun run dev` | 5000 | React frontend (preview pane) |
| **Backend API** | `cd backend && node server.js` | 3001 | Express REST API |

To start manually:
```bash
# Frontend
bun run dev

# Backend
cd backend && node server.js
```

---

## Backend API

Base URL (dev): `http://localhost:3001`

### Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Health + DB check |
| POST | `/api/auth/signup` | — | Register |
| POST | `/api/auth/login` | — | Login → JWT |
| POST | `/api/auth/logout` | — | Logout |
| GET | `/api/auth/me` | ✓ | Current user |
| PUT | `/api/auth/me` | ✓ | Update profile |
| PUT | `/api/auth/change-password` | ✓ | Change password |
| POST | `/api/content/create` | ✓ | Create content |
| GET | `/api/content/list` | ✓ | List content (filterable) |
| GET | `/api/content/:id` | ✓ | Get content |
| PUT | `/api/content/:id` | ✓ | Update content |
| DELETE | `/api/content/:id` | ✓ | Delete content |
| POST | `/api/content/generate-copy` | ✓ | AI-generate pin copy |
| POST | `/api/content/schedule` | ✓ | Schedule to platforms |
| POST | `/api/content/publish/:id` | ✓ | Publish immediately |
| GET | `/api/analytics/dashboard` | ✓ | Revenue/click summary |
| GET | `/api/analytics/niche/:niche` | ✓ | Per-niche analytics |
| POST | `/api/analytics/event` | ✓ | Track custom event |
| GET | `/api/analytics/summary` | ✓ | All-time summary |
| POST | `/api/affiliate/create-link` | ✓ | Create + shorten link |
| GET | `/api/affiliate/links` | ✓ | List links |
| GET | `/api/affiliate/links/:id` | ✓ | Get link |
| PUT | `/api/affiliate/links/:id` | ✓ | Update link |
| DELETE | `/api/affiliate/links/:id` | ✓ | Delete link |
| POST | `/api/affiliate/links/:id/click` | ✓ | Record click |
| POST | `/api/products/create` | ✓ | Create product |
| GET | `/api/products/list` | ✓ | List products |
| GET | `/api/products/:id` | ✓ | Get product |
| PUT | `/api/products/:id` | ✓ | Update product |
| DELETE | `/api/products/:id` | ✓ | Delete product |
| GET | `/api/products/:id/sales` | ✓ | Gumroad sales |
| GET | `/api/platforms/connections` | ✓ | Platform connections |
| POST | `/api/platforms/connect` | ✓ | Connect platform |
| DELETE | `/api/platforms/connections/:p` | ✓ | Disconnect platform |
| GET | `/api/platforms/scheduled-posts` | ✓ | Scheduled posts queue |
| GET | `/api/settings` | ✓ | User settings |
| PUT | `/api/settings/preferences` | ✓ | Update preferences |
| GET | `/api/settings/niches` | ✓ | Niche configs |
| POST | `/api/settings/niches` | ✓ | Create niche |
| PUT | `/api/settings/niches/:id` | ✓ | Update niche |

### Auth header
```
Authorization: Bearer <jwt_token>
```

---

## Backend structure

```
backend/
├── server.js               # Entry point
├── package.json
├── .env.example            # Template — copy to .env for local dev
├── config/
│   ├── database.js         # pg Pool
│   ├── constants.js        # App-wide enums
│   └── logger.js           # JSON logger
├── middleware/
│   ├── auth.js             # JWT verifyAuth middleware
│   ├── errorHandler.js     # Global 4-arg error handler
│   └── validation.js       # Zod validate() + schemas
├── routes/                 # One file per resource
├── services/               # External API clients (OpenAI, Pinterest, etc.)
├── jobs/                   # node-cron scheduled jobs
├── utils/
│   ├── apiResponses.js     # ok(), fail(), paginate()
│   ├── helpers.js          # buildWhereFilters, parseDateRange
│   └── encryption.js       # AES-256-GCM encrypt/decrypt
└── sql/
    └── schema.sql          # Full DDL (idempotent IF NOT EXISTS)
```

---

## Cron jobs

| Job | Schedule | What it does |
|---|---|---|
| `dailyPostingJob` | 06:00 UTC daily | Posts scheduled content to Pinterest / Buffer |
| `metricsSyncJob` | Every 6 hours | Syncs affiliate link metrics |
| `conversionTrackingJob` | Every hour | Flags high-conversion links |
| `recommendationEngineJob` | 08:00 UTC daily | AI-generates draft content ideas (requires OPENAI_API_KEY) |

---

## Environment variables & secrets

| Key | Required | Notes |
|---|---|---|
| `JWT_SECRET` | ✅ | Auto-generated; replace with your own in Replit Secrets for production |
| `DATABASE_URL` | ✅ | Managed by Replit automatically |
| `NODE_ENV` | ✅ | Set to `development` |
| `OPENAI_API_KEY` | Optional | Needed for `generate-copy` and recommendation job |
| `PINTEREST_ACCESS_TOKEN` | Optional | Pinterest v5 API |
| `YOUTUBE_API_KEY` | Optional | YouTube Data API v3 |
| `BUFFER_ACCESS_TOKEN` | Optional | Buffer scheduling |
| `GUMROAD_ACCESS_TOKEN` | Optional | Gumroad product/sales API |
| `BITLY_ACCESS_TOKEN` | Optional | URL shortening (falls back to original URL if absent) |

Add optional API keys in **Replit Secrets** (padlock icon in sidebar).

---

## Frontend notes

- `routeTree.gen.ts` is auto-generated — do not edit by hand.
- `vite.config.ts` sets `server.host: "0.0.0.0"`, `port: 5000`, and `allowedHosts: true` to work in Replit.
- The React app currently has no backend wiring — API calls need to be pointed at `http://localhost:3001`.

---

## User preferences

<!-- Add preferences here as they come up -->
