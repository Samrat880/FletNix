# FletNix — Simple work plan (no email verification)

Auth is now **register → login → browse**. No verify-email step.

---

## Part A — Done: Simple authentication

- [x] Register with email, password, age (bcrypt + JWT)
- [x] Login immediately after register (no email verification)
- [x] JWT access token + refresh cookie
- [x] Protected `/shows` routes

**Try it:** `backend npm run dev` + `frontend npm start` → Register → Login → Browse

---

## Part B — Data (your turn)

1. Put full `netflix_titles.csv` in `backend/src/scripts/`
2. MongoDB Atlas URI in `backend/.env`
3. Run: `npm run seed`
4. Confirm browse shows ~8800 titles / many pages

---

## Part C — Frontend UI (next coding task)

Match your FletNix mockup (not started):

- Sidebar navigation + genres
- Search bar styling
- Movie cards (layout, badges, hover)
- Login/register polish
- Mobile responsive layout

---

## Part D — Deploy (after B + local test)

1. Vercel backend (`backend/`) — env: `MONGODB_URI`, JWT secrets, `FRONTEND_URL`
2. Vercel frontend (`frontend/`) — update `environment.prod.ts` API URL
3. Test live: register → login → search

No email config needed for deploy.

---

## Part E — Optional later

- OAuth SSO demo (`oauth-demo/`)
- Forgot password (needs SMTP + `CLIENT_URL`)
- Playwright: `cd e2e && npm test`

---

## Minimal `.env` (backend)

```env
MONGODB_URI=...
JWT_ACCESS_SECRET=any-random-string-at-least-32-chars
JWT_REFRESH_SECRET=another-random-string-at-least-32-chars
FRONTEND_URL=http://localhost:4200
```

Email variables are **not required** anymore.
