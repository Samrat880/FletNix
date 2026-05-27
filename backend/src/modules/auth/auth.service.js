import crypto from "crypto";
import ApiError from "../../common/utils/api-error.js";
import { generateAccessToken, generateRefreshToken, generateRestToken, verifyRefreshToken } from "../../common/utils/jwt.utils.js";
import { sendResetPasswordEmail } from "../../common/config/email.js";
import User from "./auth.model.js"

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex")

const tokenPayload = (user) => ({
    id: user._id,
    role: user.role,
    age: user.age,
})

const register = async ({ name, email, password, age }) => {

    const existing = await User.findOne({email})

    if(existing) throw ApiError.conflict("User with this email already exists");

    const user = await User.create({
        name: name || "User",
        email,
        password,
        age,
    })

    const userObj = user.toObject()
    delete userObj.password

    return userObj;
}

const login = async({email,password}) => {

    const user = await User.findOne({email}).select("+password")
    if(!user) throw ApiError.unauthorized("Invalid Email or password")

    const isMatch = await user.comparePassword(password);
    if(!isMatch) throw ApiError.unauthorized("Invalid email or password")

    const accessToken = generateAccessToken(tokenPayload(user));

    const refreshToken = generateRefreshToken({ id: user._id })

    user.refreshToken = hashToken(refreshToken)
    await user.save({validateBeforeSave: false})

    const userObj = user.toObject()
    delete userObj.password
    delete userObj.refreshToken

    return {user: userObj, accessToken, refreshToken}    

};

const refresh = async(token) => {
    if(!token) throw ApiError.unauthorized("Refresh token missing")
    const decoded = verifyRefreshToken(token)

    const user = await User.findById(decoded.id).select("+refreshToken")

    if(!user) throw ApiError.unauthorized("User not found")

    if(user.refreshToken !== hashToken(token)){
        throw ApiError.unauthorized("Invalid refresh token");
    }

    const accessToken = generateAccessToken(tokenPayload(user))
    const refreshToken = generateRefreshToken({ id: user._id })

    user.refreshToken = hashToken(refreshToken)
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
}

const logout = async (userId) => {
    await User.findByIdAndUpdate(userId, { refreshToken: null})
}

const forgotPassword = async (email) => {
    const user = await User.findOne({email});
    if(!user) return;

    const { rawToken, hashedToken } = generateRestToken();
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();
    await sendResetPasswordEmail(email, rawToken);
}

const resetPassword = async (token, password, passwordConfirm) => {
    if(password !== passwordConfirm) {
        throw ApiError.badRequest("Password and confirm password do not match");
    }

    const tokenHash = hashToken(token);
    const user = await User.findOne({
        resetPasswordToken: tokenHash,
        resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if(!user) throw ApiError.notFound("Invalid or expired reset token");

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return user;
}

const getMe = async(userId) => {
    const user = await User.findById(userId);
    if(!user) throw ApiError.notFound("User not found");
    return user;
}

const savePreferences = async (userId, genres) => {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound("User not found");

    user.favoriteGenres = genres;
    user.preferencesCompleted = true;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;

    return userObj;
}



export { 
    register,
     login, 
     refresh, 
     logout, 
     forgotPassword, 
    resetPassword,
     getMe,
     savePreferences,
}
