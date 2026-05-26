import crypto from "crypto"
import jwt from 'jsonwebtoken'

const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_TOKEN

const generateAccessToken = (payload) => {
    return jwt.sign(payload, accessSecret, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN
    })
}

const verifyAccessToken = (token) => {
    return jwt.verify(token, accessSecret)
}

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || process.env.JWT_REFRESH_EXPRIES_IN || "7d"
    })
}

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
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