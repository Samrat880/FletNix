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

## Deploy on Vercel

Create **two** Vercel projects from this repo:

| Project | Root directory | Build | Output |
|---------|----------------|-------|--------|
| API | `backend` | — | Serverless (`api/index.js`) |
| Web | `frontend` | `npm run build` | `dist/frontend/browser` |

**Backend env vars:** `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, `CLIENT_URL`, `EMAIL_DEV_MODE` or SMTP/Mailtrap.

**Frontend:** Update `frontend/src/environments/environment.prod.ts` with your API URL.

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
