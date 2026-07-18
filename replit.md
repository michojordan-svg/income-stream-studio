# Income Autopilot

A dashboard app for tracking automated income streams across Pinterest affiliates, YouTube monetization, and digital products.

## Stack

- **Framework**: TanStack Start (React 19 + SSR via Nitro)
- **Router**: TanStack Router (file-based routing in `src/routes/`)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Package manager**: Bun
- **Build tool**: Vite via `@lovable.dev/vite-tanstack-config`

## Running the app

```bash
bun run dev
```

Dev server runs on `http://localhost:5000`.

The workflow **Start application** (`bun run dev`) is configured and starts automatically.

## Project structure

```
src/
  routes/         # File-based pages (TanStack Router)
  components/     # Reusable UI components (shadcn/ui)
  hooks/          # Custom React hooks
  lib/            # Utilities and helpers
  styles.css      # Global styles
  start.ts        # TanStack Start server entry
  server.ts       # SSR error wrapper
```

## Notes

- `routeTree.gen.ts` is auto-generated — do not edit by hand.
- `vite.config.ts` sets `server.host: "0.0.0.0"` and `server.port: 5000` to work in the Replit environment (the bundled `@lovable.dev/vite-tanstack-config` defaults to IPv6 `::` on port 8080, which isn't supported here).
- The app is currently frontend-only with no backend database or auth wired up.

## User preferences

<!-- Add preferences here as they come up -->
