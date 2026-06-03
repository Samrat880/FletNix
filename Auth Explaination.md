

## 1. Response JSON (what the API returns)

**DevTools:** Network → `login` → **Response**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "name": "Samrat",
      "email": "samrat@gmail.com",
      "age": 20,
      "role": "user",
      "favoriteGenres": ["..."],
      "preferencesCompleted": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Included in response:**

| Field | Yes / No | Why |
|-------|----------|-----|
| `user` (profile) | Yes | For the UI after login |
| `accessToken` | Yes | Short-lived JWT; frontend saves in `localStorage` |
| `password` | **No** | Never sent back |
| `refreshToken` | **No** | Sent in cookie instead (see below) |

**Backend code** (`auth.controller.js`):

```javascript
res.cookie("refreshToken", refreshToken, { httpOnly: true, ... })
ApiResponse.ok(res, "Login successful", { user, accessToken })
// refreshToken is NOT inside ApiResponse.ok data
```

**Screenshot 2 — Login response JSON (no refreshToken field)**

<img width="1910" height="932" alt="image" src="https://github.com/user-attachments/assets/cc319709-e7d2-4c28-8184-ad306bd3e0db" />




<br><br><br>

---

## 2. Refresh token in cookie (not in response body)

**DevTools:** Network → `login` → **Headers** → Response Headers  

Look for:

```
Set-Cookie: refreshToken=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Secure; SameSite=Lax
```

| Flag | Meaning |
|------|---------|
| **HttpOnly** | JavaScript cannot read it (safer against XSS) |
| **Secure** | HTTPS only in production |
| **SameSite=Lax** | Helps protect against CSRF |

Frontend uses `withCredentials: true` so the browser sends this cookie on `/auth/refresh-token`.

<img width="1907" height="932" alt="image" src="https://github.com/user-attachments/assets/34bbc56f-bc1e-4b39-b255-d65418be3dc8" />






<br><br><br>

---

## 3. Refresh token hashed in MongoDB

After login, the server saves **hash(refreshToken)** in the user document — **not** the same string as the cookie.

**DevTools:** MongoDB Atlas → database `fletnix` → collection `users`

Example fields:

```json
{
  "email": "test1@gmail.com",
  "password": "$2b$12$N8AOA.h.R/IBQelg6MsbIu...",
  "refreshToken": "8b3545bc33a3b30e9d314ce6bf42f76ed66788913a7f7403ae46518e2ef9e82e"
}
```

| Field | What it is |
|-------|------------|
| `password` | **bcrypt hash** (`$2b$12$...`) |
| `refreshToken` | **SHA-256 hash** (64 hex chars) — not the JWT from the cookie |

**Service** (`auth.service.js`):

```javascript
user.refreshToken = hashToken(refreshToken)  // SHA-256
await user.save()
```

On **logout**, `refreshToken` is cleared in DB and the cookie is removed.

**Screenshot 4 — MongoDB Atlas user document (password + refreshToken fields)**

<img width="1477" height="868" alt="image" src="https://github.com/user-attachments/assets/0dbcad18-9b78-4ce5-9b66-e8b6ee9c7a48" />




<br><br><br>

---

## Why we did NOT put refresh token in the response JSON

| Reason | Explanation |
|--------|-------------|
| **Security (XSS)** | JSON is handled by JavaScript. If refresh token were in the body, apps often store it in `localStorage`, where XSS can steal it. **httpOnly cookies** cannot be read by JS. |
| **Two tokens, two jobs** | **Access token** = short life, every API call (`Authorization: Bearer`). **Refresh token** = long life, only to get a new access token. |
| **Database hash** | DB stores a **hash** to validate and revoke sessions. Cookie holds the **raw JWT** needed for the next refresh request. |
| **Not missing** | Refresh token is implemented — it is in **cookie + DB**, not in Response tab JSON. |



## Side-by-side summary

| Data | Request Payload | Response JSON | Cookie | MongoDB |
|------|-----------------|---------------|--------|---------|
| Email | ✅ | ✅ in `user` | — | ✅ |
| Plain password | ✅ (HTTPS) | ❌ | — | ❌ (bcrypt only) |
| Access JWT | — | ✅ | — | ❌ |
| Refresh JWT (raw) | — | ❌ | ✅ | ❌ |
| Refresh hash | — | ❌ | — | ✅ |

---

## Auth flow (simple)

```
LOGIN
  Client  --Payload: email, password-->  API
  API     --compares bcrypt password-->   MongoDB
  API     --saves hash(refreshToken)-->  MongoDB
  API     --JSON: user + accessToken-->  Client
  API     --Set-Cookie: refreshToken-->  Browser

REFRESH (when access token expires)
  Client  --Cookie: refreshToken-->      API
  API     --hash(cookie) == DB hash-->   OK → new accessToken + rotate cookie & DB

LOGOUT
  API     --clear DB refreshToken + clear cookie-->
```
