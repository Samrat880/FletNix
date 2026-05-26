# FletNix

**What to watch** — Search and filter Netflix catalog data with JWT auth, age restrictions, and optional OAuth2 SSO.

## Project structure

```
├── backend/       Express API + MongoDB
├── frontend/      Angular 17 + Tailwind
├── e2e/           Playwright tests
├── oauth-demo/    SSO demo client (Live Server on port 5500)
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB (Docker or Atlas)
- `netflix_titles.csv` — place at `backend/src/scripts/netflix_titles.csv` (a 20-row sample is included for dev; replace with the full assignment file for production)

## Local setup

### Backend

```bash
cd backend
cp .env.example .env
# Set MONGODB_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET

npm install
npm run seed     # import CSV (requires netflix_titles.csv)
npm run dev      # http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm start        # http://localhost:4200
```

### Auth flow

1. Register at `/register` with email, password, and age.
2. Sign in at `/login` (no email verification required).

Users under **18** do not receive **R-rated** titles (enforced on the API).

See [WORK_PLAN.md](WORK_PLAN.md) for step-by-step tasks.

## API reference

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/auth/register` | No |
| POST | `/api/v1/auth/login` | No |
| GET | `/api/v1/shows?page=1&limit=15&type=Movie&search=matrix` | Bearer JWT |
| GET | `/api/v1/shows/:id` | Bearer JWT |
| GET | `/api/v1/oauth/authorize` | Bearer JWT (SSO) |
| POST | `/api/v1/oauth/token` | Client credentials + PKCE |
| GET | `/api/v1/oauth/userinfo` | Bearer JWT |

## E2E tests (Playwright)

```bash
cd e2e
npm install
npx playwright install chromium
npm test
```

Requires backend (`:5000`) and frontend (`:4200`) running, or uses `reuseExistingServer` when already up.

## Deploy on Vercel (monorepo — one project)

Use **one** Vercel project with root directory `./`.

**Important:** Set **Framework Preset** to **Other** (not Services). Root `vercel.json` handles routing.

| Path | Handler |
|------|---------|
| `/`, `/login`, `/browse`, … | Angular static build |
| `/api/v1/...` | Express API (`api/index.js` → `backend`) |

### Steps

1. Import `Samrat880/FletNix` on Vercel.
2. **Root Directory:** `./`
3. **Framework Preset:** **Other**
4. Add **Environment Variables**:

   | Variable | Value |
   |----------|--------|
   | `MONGODB_URI` | Atlas connection string |
   | `JWT_ACCESS_SECRET` | min 32 characters |
   | `JWT_REFRESH_SECRET` | min 32 characters |
   | `JWT_ACCESS_EXPIRES_IN` | `15m` |
   | `JWT_REFRESH_EXPIRES_IN` | `7d` |
   | `FRONTEND_URL` | your Vercel URL, e.g. `https://flet-nix.vercel.app` |
   | `NODE_ENV` | `production` |

5. Deploy.
6. Test API: `https://YOUR-APP.vercel.app/api/v1/health`
7. Test app: `https://YOUR-APP.vercel.app`

Production frontend uses `/api/v1` (same domain).

### Alternative: two separate Vercel projects

| Project | Root directory | Notes |
|---------|----------------|--------|
| API | `backend` | Set full API URL in `environment.prod.ts` |
| Web | `frontend` | Build: `npm run build`, output: `dist/frontend/browser` |

## OAuth2 SSO (interview demo)

See [backend/src/modules/oauth/README.md](backend/src/modules/oauth/README.md).

1. Serve `oauth-demo/` on port 5500 (VS Code Live Server).
2. Login to FletNix and paste your access token.
3. Click **Sign in with FletNix** to complete the PKCE flow.

## Rubric coverage

- Authentication (email, password, age, bcrypt, JWT)
- Paginated list (15 per page)
- Search (title + cast)
- Age restriction (no R for under 18)
- Filter by type (Movie / TV Show)
- Detail page (all fields)
- Tailwind responsive UI
- Playwright E2E
- Hosting-ready (Vercel config)

## License

ISC
