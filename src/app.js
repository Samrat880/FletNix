import express from "express"
import cookieParser from "cookie-parser"
import authRoutes from "./modules/auth/auth.routes.js"
import ApiError from "./common/utils/api-error.js"

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use("/api/v1/auth", authRoutes)

app.use((err, req, res, next) => {
	if(err instanceof ApiError){
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
