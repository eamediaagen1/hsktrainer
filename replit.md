# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the HSK Chinese Vocabulary Trainer — a premium web app with a React/Vite frontend and a secured Express API backend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 + helmet + express-rate-limit
- **Auth**: Supabase (magic-link email, JWTs, RLS)
- **Payments**: Gumroad webhooks (premium subscription gating)
- **Database**: Replit PostgreSQL (profiles, saved_words, purchases tables)
- **Frontend**: React 18 + Vite + TanStack Query + Wouter + Framer Motion + shadcn/ui
- **Validation**: Zod (`zod/v4`)

## Project Structure

```text
workspace/
├── artifacts/
│   ├── api-server/          # Express API — auth, lessons, progress, webhooks
│   └── hsk-trainer/         # React + Vite frontend
├── lib/
│   ├── api-spec/            # OpenAPI spec + Orval codegen
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod schemas
│   └── db/                  # Drizzle ORM schema + DB connection
├── migrations/
│   └── 001_supabase_schema.sql  # profiles, saved_words, purchases + RLS
├── scripts/                 # Utility scripts
└── pnpm-workspace.yaml
```

## HSK Trainer — Feature Summary

### Access Model
- **HSK 1**: Free, words served from bundled `hskData.ts` (frontend-only)
- **HSK 2–6**: Premium, words served exclusively from `GET /api/lessons?level=N` (requires valid Supabase JWT + `is_premium = true` in DB)

### Frontend (`artifacts/hsk-trainer`)
- **Pages**: MarketingPage, LandingPage (magic link), AuthCallback, LevelSelection, FlashcardPage, ReviewPage, QuizPage, ProgressPage, SettingsPage
- **Auth context**: `src/contexts/auth-context.tsx` — `AuthProvider` + `useAuth` hook
- **Data hooks**: `use-profile.ts`, `use-saved-words.ts` (wraps API + Supabase saved_words)
- **API layer**: `src/lib/api.ts` — `apiFetch` with Bearer token injection + `ApiError` class
- **Supabase client**: `src/lib/supabase.ts` — graceful no-op if secrets absent
- **Route guard**: `ProtectedPages` in `App.tsx` (redirects to `/app` if unauthenticated)
- **HSK data**: `src/data/hskData.ts` — HSK 1 only (188 lines); HSK 2–6 removed from frontend bundle

### API Server (`artifacts/api-server`)
- **app.ts**: helmet, CORS (restricted to `APP_URL`), rate limiter, routes at `/api`
- **Routes**:
  - `GET /api/healthz` — health check
  - `GET /api/me` — returns profile (auth required)
  - `POST /api/premium/sync` — syncs premium status from Gumroad purchases table
  - `GET /api/lessons?level=N` — serves word list (level 1 open; 2–6 require premium)
  - `POST /api/progress` — upsert word progress (auth required)
  - `GET /api/progress` — list user progress (auth required)
  - `POST /api/gumroad/webhook` — Gumroad ping validation + purchases insert
  - `GET /api/admin/users` — admin only, lists all profiles
- **Middleware**: `src/middleware/auth.ts` (verifyJwt, requirePremium), rate limiter
- **Supabase**: `src/supabase.ts` — service role client, logs warning if secrets absent

### Database Schema (`migrations/001_supabase_schema.sql`)
- `profiles` — id (Supabase UID), email, is_premium, role ('user' | 'admin'), timestamps
- `saved_words` — user_id, word_id, next_review, interval, ease_factor, reps (SRS)
- `purchases` — id, user_id, gumroad_sale_id, product_permalink, status, timestamps
- Row Level Security enabled on all tables

## Required Secrets (Replit Secrets)

| Secret | Used by | Purpose |
|--------|---------|---------|
| `SUPABASE_URL` | API server | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | API server | Admin key for JWT verification |
| `SUPABASE_ANON_KEY` | API server | Public key |
| `VITE_SUPABASE_URL` | Frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Public anon key |
| `GUMROAD_WEBHOOK_SECRET` | API server | Validates Gumroad pings |
| `GUMROAD_PRODUCT_PERMALINK` | API server | Filters product-specific purchases |
| `APP_URL` | API server | Allowed CORS origin (e.g. `https://yourapp.replit.app`) |
| `VITE_GUMROAD_URL` | Frontend | Gumroad checkout link shown to users |

## Setup Checklist

1. Run `migrations/001_supabase_schema.sql` in Supabase SQL editor
2. Set all secrets listed above in Replit Secrets
3. After first sign-in, promote yourself to admin: `UPDATE profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL';`
4. Configure Gumroad webhook URL: `https://<APP_URL>/api/gumroad/webhook?secret=<GUMROAD_WEBHOOK_SECRET>`

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` (`composite: true`). Run `pnpm run typecheck` from the root to type-check the full dependency graph.

## Root Scripts

- `pnpm run build` — typecheck + build all packages
- `pnpm run typecheck` — `tsc --build --emitDeclarationOnly`

## Word ID Format

Word IDs follow the pattern `hsk{level}-{category}{n}` (e.g. `hsk1-f1`, `hsk2-1`). The ProgressPage parses the level from the id using `/^hsk(\d)/`.
