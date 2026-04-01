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
- **Pages**: MarketingPage, LandingPage (magic link), AuthCallback, DashboardPage (`/dashboard`), LevelSelection (`/levels`), FlashcardPage, ReviewPage, QuizPage, ProgressPage, SettingsPage, AdminPage / AdminLoginPage
- **Auth context**: `src/contexts/auth-context.tsx` — `AuthProvider` + `useAuth` hook
- **Data hooks**: `use-profile.ts`, `use-saved-words.ts`, `use-study-prefs.ts`
  - `useStudyPrefs()` → `{ prefs: { showPinyin, autoPlay, lastLevel }, set }` — persisted to `hsk_study_prefs` in localStorage
- **API layer**: `src/lib/api.ts` — `apiFetch` with Bearer token injection + `ApiError` class
- **Supabase client**: `src/lib/supabase.ts` — graceful no-op if secrets absent
- **Route guard**: `ProtectedPages` in `App.tsx` (redirects to `/app` if unauthenticated)
- **HSK data**: `src/data/hskData.ts` — HSK 1 only (188 lines); HSK 2–6 removed from frontend bundle
- **Study prefs wired**: FlashcardPage reads `prefs.showPinyin` → toggles pinyin on card front; `prefs.autoPlay` → auto-speaks word on card advance; updates `lastLevel` pref on mount

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

## Admin Panel

Accessible at `/admin` — requires `role = 'admin'` in the `profiles` table. Has its own layout (no sidebar). All actions are server-verified.

### Routes
- `/admin/login` — dedicated admin verification page (password-only; sets 60-min session)
- `/admin` — Dashboard (overview stats)
- `/admin/users` — User search + detail panel
- `/admin/purchases` — Purchase list with filter chips
- `/admin/logs` — Admin audit log with action filter
- `/admin/settings` — Env health + runtime settings editor

### Identity Verification
The admin panel is viewable in read-only mode once you're signed in as admin. To enable write actions (grant/revoke/link/settings), you must verify at `/admin/login` using email + password. Verification is stored in `sessionStorage` and expires after 60 minutes. The server independently verifies admin role on every API call regardless.

### Features
- **Dashboard**: 6 stat cards (total users, premium users, 7-day signups, 7-day purchases, refunds, unlinked purchases) + recent admin activity feed
- **Users**: partial email search (live, debounced), user list, click-to-expand detail panel with profile / premium / progress / purchases / audit log; Grant/Revoke/Link actions require reason + verified identity
- **Purchases**: list with filter chips (All / Paid / Refunded / Linked / Unlinked); shows linkage status and guidance
- **Logs**: admin log feed filtered by action type (grants, revokes, link, settings)
- **Config**: env health grid (true/false only — no secrets exposed); editable `app_settings` with allowlist enforcement and change logging

### Admin API Routes (all protected by `requireAuth + requireAdmin`)
- `GET /api/admin/overview` — dashboard aggregate stats
- `GET /api/admin/users?q=fragment` — user list with partial email search
- `GET /api/admin/users/:id` — full user detail by UUID
- `GET /api/admin/user?email=` — full user detail by email (legacy)
- `GET /api/admin/purchases?filter=all|paid|refunded|linked|unlinked`
- `POST /api/admin/grant-premium` — requires `reason` (400 if missing)
- `POST /api/admin/revoke-premium` — requires `reason` (400 if missing)
- `POST /api/admin/link-purchase` — links purchase; guards against re-linking
- `GET /api/admin/logs?user_id=&action=` — filtered admin log
- `GET /api/admin/config` — env health check (true/false only, no raw values)
- `GET /api/admin/settings` — list app_settings
- `POST /api/admin/settings` — update allowlisted key (logged)

### Admin Audit Log (`admin_logs` table)
Every grant, revoke, link, and setting change writes a row with admin user ID, target user ID, action name, required reason, and metadata JSON.

### Frontend file structure
```
src/pages/
  AdminLoginPage.tsx        — /admin/login (standalone, no AppShell)
  AdminPage.tsx             — /admin/* shell (tabs + auth guard)
  admin/
    adminTypes.ts           — shared TypeScript types
    adminUtils.tsx          — helpers: fmt, StatusBadge, isAdminVerified, etc.
    DashboardTab.tsx
    UsersTab.tsx            — UserListItem + UserDetailPanel
    PurchasesTab.tsx
    LogsTab.tsx
    ConfigTab.tsx
```

## Setup Checklist

1. Run `migrations/001_supabase_schema.sql` in Supabase SQL editor
2. Run `migrations/002_admin_tables.sql` in Supabase SQL editor
3. Run `migrations/003_password_auth_support.sql` in Supabase SQL editor
4. Run `migrations/004_admin_panel_upgrade.sql` in Supabase SQL editor (indexes + seed)
5. Set all secrets listed above in Replit Secrets
6. After first sign-in, promote yourself to admin: `UPDATE profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL';`
7. Configure Gumroad webhook URL: `https://<APP_URL>/api/gumroad/webhook?secret=<GUMROAD_WEBHOOK_SECRET>`
8. Access admin panel at `<APP_URL>/admin` — verify at `/admin/login` to enable write actions

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` (`composite: true`). Run `pnpm run typecheck` from the root to type-check the full dependency graph.

## Root Scripts

- `pnpm run build` — typecheck + build all packages
- `pnpm run typecheck` — `tsc --build --emitDeclarationOnly`

## Word ID Format

Word IDs follow the pattern `hsk{level}-{category}{n}` (e.g. `hsk1-f1`, `hsk2-1`). The ProgressPage parses the level from the id using `/^hsk(\d)/`.
