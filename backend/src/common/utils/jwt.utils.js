import crypto from "crypto"
import jwt from 'jsonwebtoken'

const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_TOKEN
const refreshSecret = process.env.JWT_REFRESH_SECRET

const generateAccessToken = (payload) => {
    return jwt.sign(payload, accessSecret, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    })
}

const verifyAccessToken = (token) => {
    return jwt.verify(token, accessSecret)
}

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, refreshSecret, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    })
}

const verifyRefreshToken = (token) => {
  return jwt.verify(token, refreshSecret);
};

const generateRestToken = () => {
    const rawToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")

    return { rawToken, hashedToken}
}

export {
    generateRestToken,
    verifyAccessToken,
    verifyRefreshToken,
    generateAccessToken,
    generateRefreshToken
}