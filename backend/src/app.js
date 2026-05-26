import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import authRoutes from "./modules/auth/auth.routes.js"
import showsRoutes from "./modules/shows/shows.routes.js"
import oauthRoutes from "./modules/oauth/oauth.routes.js"
import ApiError from "./common/utils/api-error.js"

const app = express()

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:4200",
].filter(Boolean)

if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`)
}

app.use(helmet())
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(null, allowedOrigins[0])
      }
    },
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use("/api/v1/auth", authLimiter, authRoutes)
app.use("/api/v1/shows", showsRoutes)
app.use("/api/v1/oauth", oauthRoutes)

app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, message: "FletNix API is running" })
})

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
  }

  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  })
})

export default app
