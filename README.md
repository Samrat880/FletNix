# FletNix

**What to watch** — A Netflix-style streaming catalog with JWT authentication, age-based content filtering, search.

Built as a full-stack monorepo: **Angular 17** frontend, **Express + MongoDB** backend, deployed on **Vercel**.

---

## Live demo

| App | URL |
|-----|-----|
| **Web app** | [https://flet-nix-a9xe.vercel.app](https://flet-nix-a9xe.vercel.app) |
| **API health** | [https://flet-nix-six.vercel.app/api/v1/health](https://flet-nix-six.vercel.app/api/v1/health) |
| **GitHub** | [https://github.com/Samrat880/FletNix](https://github.com/Samrat880/FletNix) |

### Demo account

Use these credentials to sign in without registering:

| Field | Value |
|-------|-------|
| **Email** | `samrat@gmail.com` |
| **Password** | `Test1234` |

After login you can browse movies & TV shows, search, filter, and open detail pages.

**Note:** On first login (including the demo account), you will be asked to pick favorite genres before browsing.

---

## Features

### Authentication & authorization
- Register and login with email, password, and age
- Passwords hashed with **bcrypt**
- **JWT** access tokens + httpOnly refresh token cookies
- Protected routes — browse and detail pages require login
- Users **under 18** do not see **R-rated** titles (enforced on the API)

### Genre preference onboarding
- After login, users without saved preferences are sent to `/preferences`
- Pick **1–10 genres** from Netflix catalog categories (`listed_in` tags)
- Choices are saved on the user profile (`favoriteGenres`)
- A **"Picked for you"** row at the top surfaces genre matches; the full catalog (~8806 titles) remains browsable below
- Search scans all titles; a single match opens the detail page directly
- Returning users with completed preferences go straight to `/browse`

### Catalog browsing
- Paginated catalog (**15 items per page**)
- Search by **title** and **cast**
- Filter by type (Movie / TV Show), country, year, language, and rating
- Netflix-style browse UI with hero carousel, sidebar navigation, and detail pages
- Responsive layout with **Tailwind CSS**

### Optional extras
- **OAuth2 SSO** (Authorization Code + PKCE) — see [oauth module docs](backend/src/modules/oauth/README.md)
- **Playwright E2E** tests in `e2e/`
- **MongoDB Atlas** seed script for ~8,800 Netflix titles

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 17, Tailwind CSS, RxJS |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT, bcrypt, httpOnly cookies |
| Testing | Playwright |
| Hosting | Vercel (two projects, one repo) |

---

## Project structure

```
FletNix/
├── backend/                 # Express REST API
│   ├── api/index.js         # Vercel serverless entry
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/        # Register, login, JWT refresh
│   │   │   ├── shows/       # Catalog, search, filters
│   │   │   └── oauth/       # OAuth2 SSO (PKCE)
│   │   ├── common/          # DB, email, JWT utils
│   │   └── scripts/         # CSV seed script
│   └── vercel.json
├── frontend/                # Angular SPA
│   ├── src/app/
│   │   ├── features/        # login, register, browse, detail
│   │   ├── core/            # guards, interceptors, services
│   │   └── shared/          # show cards, pagination
│   └── vercel.json
├── e2e/                     # Playwright tests
├── oauth-demo/              # OAuth SSO demo client
└── README.md
```

---

## Quick start (local)

### Prerequisites

- **Node.js 18+**
- **MongoDB** — Docker locally or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)
- **CSV data** — place `netflix_titles.csv` at `backend/src/scripts/netflix_titles.csv`

### 1. Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` — at minimum set:

```env
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=your-secret-min-32-characters-long
JWT_REFRESH_SECRET=your-secret-min-32-characters-long
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:4200
```

Then:

```bash
npm install
npm run seed          # one-time CSV import
npm run dev           # http://localhost:5000
```

Verify: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

### 2. Frontend

```bash
cd frontend
npm install
npm start             # http://localhost:4200
```

### 3. Try it

1. Open [http://localhost:4200](http://localhost:4200)
2. Register a new account **or** use the demo credentials above
3. Browse, search, filter, and open a show detail page

---

## API reference

Base URL (production): `https://flet-nix-six.vercel.app/api/v1`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | No | Create account |
| `POST` | `/auth/login` | No | Login, returns access token |
| `PUT` | `/auth/preferences` | Bearer | Save favorite genres (onboarding) |
| `POST` | `/auth/refresh` | Cookie | Refresh access token |
| `POST` | `/auth/logout` | Bearer | Logout |
| `GET` | `/auth/me` | Bearer | Current user profile |
| `GET` | `/shows` | Bearer | Paginated catalog |
| `GET` | `/shows/meta` | Bearer | Filter options (countries, years, etc.) |
| `GET` | `/shows/:id` | Bearer | Show detail |
| `GET` | `/health` | No | API status check |

### Shows query parameters

| Param | Example | Description |
|-------|---------|-------------|
| `page` | `1` | Page number |
| `limit` | `15` | Items per page |
| `type` | `Movie` | Filter by Movie or TV Show |
| `search` | `matrix` | Search title and cast |
| `country` | `United States` | Filter by country |
| `release_year` | `2020` | Filter by year |
| `language` | `English` | Filter by language |
| `rating` | `PG-13` | Filter by rating |

---

## Deploy on Vercel

The live app uses **two Vercel projects** from the **same GitHub repo** (no separate repos needed).

### Backend (`flet-nix-six`)

| Setting | Value |
|---------|--------|
| Root Directory | `backend` |
| Framework Preset | **Other** |
| Build / Output / Install | leave empty |

**Environment variables:**

| Variable | Example |
|----------|---------|
| `MONGODB_URI` | Atlas connection string |
| `JWT_ACCESS_SECRET` | min 32 characters |
| `JWT_REFRESH_SECRET` | min 32 characters |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | `https://flet-nix-a9xe.vercel.app` |
| `NODE_ENV` | `production` |

### Frontend (`flet-nix-a9xe`)

| Setting | Value |
|---------|--------|
| Root Directory | `frontend` |
| Framework Preset | **Angular** |
| Build Command | `npm run build` |
| Output Directory | `dist/frontend/browser` |

Production API URL is set in `frontend/src/environments/environment.prod.ts`:

```ts
apiUrl: 'https://flet-nix-six.vercel.app/api/v1'
```

---

## E2E tests

```bash
cd e2e
npm install
npx playwright install chromium
npm test
```

Requires backend (`:5000`) and frontend (`:4200`) running locally.

---

## OAuth2 SSO demo

FletNix can act as an **identity provider** for third-party apps using Authorization Code + PKCE.

1. Start backend and frontend locally
2. Serve `oauth-demo/` on port 5500 (VS Code Live Server)
3. Login to FletNix and paste your access token
4. Click **Sign in with FletNix**

Full details: [backend/src/modules/oauth/README.md](backend/src/modules/oauth/README.md)

---

## Assignment rubric coverage

| Requirement | Status |
|-------------|--------|
| Authentication (email, password, age, bcrypt, JWT) | Done |
| Genre preference onboarding + personalized browse | Done |
| Paginated list (15 per page) | Done |
| Search (title + cast) | Done |
| Age restriction (no R for under 18) | Done |
| Filter by type (Movie / TV Show) | Done |
| Detail page (all metadata fields) | Done |
| Tailwind responsive UI | Done |
| Playwright E2E tests | Done |
| Hosted on Vercel | Done |

---

## License

ISC
