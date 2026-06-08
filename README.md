# MyTicket — Vendor Dashboard

Standalone micro-frontend for Vendor users at `vendor.myticket.com` (dev: [http://localhost:5176](http://localhost:5176)).

## Features

- Login (email/password + Google OAuth)
- Vendor role application wizard with documents and gallery (pre-approval)
- Application status tracking with polling (submitted / rejected / approved)
- Post-approval profile management
- Availability display (`available` / `reserved`, read-only until API ships)
- Engagements inbox (accept, decline, message, complete)
- Ratings display (stars only)
- Public profile preview with link to main marketplace
- Settings (language, notifications summary, account links)
- Bilingual UI (English / Arabic) with RTL support

## Stack

Bun · Vite 8 · React 19 · TypeScript · Tailwind CSS 4 · Lucide · Redux Toolkit · RTK Query · react-hook-form · Yup · react-i18next

## Scripts

```bash
bun install
bun run dev      # http://localhost:5176
bun run build
bun run test
bun run lint
```

## Environment

Copy `.env.example` to `.env` and set:

- `VITE_API_BASE_URL` — API host (default `http://localhost:8000`)
- `VITE_API_PREFIX` — API prefix (default `/api/v1/main`)
- `VITE_MAIN_WEBSITE_URL` — main site for tickets/public profiles
- `VITE_VENDOR_DASHBOARD_URL` — this app's URL (for OAuth redirects)
- `VITE_UPLOAD_URL` — optional CDN upload endpoint for application media

## Documentation

- [myticket_vendor_dashboard_guide.md](myticket_vendor_dashboard_guide.md) — full build guide
- [frontend-handoff-vendor-api.md](frontend-handoff-vendor-api.md) — API reference

## Main website handoff

The main website (`main/`) redirects vendor users to this app:

| Main route | Vendor dashboard target |
|---|---|
| Register → Vendor role | `/application` |
| `/vendor-portal` | `/` |
| `/vendor-portal/application` | `/application` |
| `/vendor-portal/profile` | `/profile` |
| `/vendor-portal/engagements` | `/engagements` |
| `/engagements` (vendor user) | `/engagements` (preserves `?focus=` query) |
| `/profile` (approved vendor) | `/profile` |

Set on the main site `.env`:

`VITE_VENDOR_DASHBOARD_URL=http://localhost:5176`

## Deployment

Production URL: `https://vendor.myticket.com`

### VPS (GitHub Actions)

Push to `master` runs `.github/workflows/deploy-vps.yml`, which:

1. `bun install --frozen-lockfile`
2. `bun run build`
3. Rsyncs `dist/` to `/var/www/html/myticket/myticket-vendor` on the VPS

Required repository secrets (same as other MyTicket frontends):

- `VPS_SSH_PRIVATE_KEY`
- `VPS_HOST`
- `VPS_USER`

### CI

Every push/PR runs `.github/workflows/ci.yml` (`lint` → `test` → `build`).

### Production env (build-time)

Set these when building for production (also configured in `.github/workflows/deploy-vps.yml`):

- `VITE_API_BASE_URL` — API host
- `VITE_API_PREFIX` — `/api/v1/main`
- `VITE_MAIN_WEBSITE_URL` — `https://myticket.com`
- `VITE_VENDOR_DASHBOARD_URL` — `https://vendor.myticket.com`
- `VITE_UPLOAD_URL` — CDN upload endpoint for application media

### Auth handoff (production)

On `*.myticket.com`, auth cookies use `Domain=.myticket.com` so a session started on `myticket.com` is readable on `vendor.myticket.com`. Local dev (different ports) still requires signing in again; the login page pre-fills `email` from main redirects and shows a handoff hint when `source=main-website`.
