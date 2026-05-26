import * as authService from "./auth.service.js"
import ApiResponse from "../../common/utils/api-response.js"
 
const register = async (req,res) => {
    const user = await authService.register(req.body)
    ApiResponse.created(res, "Registration successful", user)

}

const login = async (req, res) =>{
    const {user, accessToken, refreshToken} = await authService.login(req.body)
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 *60 * 1000,
    }

    res.cookie("refreshToken", refreshToken, cookieOptions)
    ApiResponse.ok(res, "Login successful", {user, accessToken})
};

const refreshToken = async (req, res) => {
    const token = req.cookies?.refreshToken
    const tokens = await authService.refresh(token)
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 *60 * 1000,
    }

    res.cookie("refreshToken", tokens.refreshToken, cookieOptions)
    ApiResponse.ok(res, "Token refreshed", { accessToken: tokens.accessToken })
}

const logout = async ( req, res) => {
    await authService.logout(req.user.id )
    res.clearCookie("refreshToken")
    ApiResponse.ok(res, "Logout successfully")
}

const getMe = async (req, res) => {
    const user = await authService.getMe(req.user.id);
    ApiResponse.ok(res, "Profile fetched", user)
}

const forgotPassword = async (req, res) => {
    await authService.forgotPassword(req.body.email)
    ApiResponse.ok(res, "Password reset link sent to your email")
}

const resetPassword = async (req, res) => {
    const user = await authService.resetPassword(req.params.token, req.body.password, req.body.passwordConfirm)
    ApiResponse.ok(res, "Password reset successfully", user)
}
 

export {
    register,
    login,
    refreshToken,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
}

