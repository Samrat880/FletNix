import crypto from "crypto";
import ApiError from "../../common/utils/api-error.js";
import { generateAccessToken, generateRefreshToken, generateRestToken, verifyRefreshToken } from "../../common/utils/jwt.utils.js";
import User from "./auth.model.js"

const sendVerificationEmail = async (email, token) => {
    // TODO: Implement real email sending (sendgrid, nodemailer, etc.)
    console.log(`Verification token for ${email}: ${token}`)
}


const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex")

const register = async ({name, email, password, role}) => {

    const existing = await User.findOne({email})

    if(existing) throw ApiError.conflict("User with same Email exisits");

    const { rawToken, hashedToken } = generateRestToken()
 

    const user = await User.create({
        name,
        email,
        password,
        role,
        verificationToken: hashedToken,
    })

    try{
        await sendVerificationEmail(email, rawToken)
    }catch (error){
        console.log(error)
    }

    const userObj =user.toObject()
    delete userObj.password
    delete userObj.verificationToken 


    return userObj;
}

const login = async({email,password}) => {
    //take email and find user in DB
    //then check if password is correct
    // check if verified or not
    //if user doesnt exist login

    const user = await User.findOne({email}).select("+password")
    if(!user) throw ApiError.unauthorized("Invalid Email or password")

    const isMatch = await user.comparePassword(password);
    if(!isMatch) throw ApiError.unauthorized("Invalid email or password")

    if(!user.isVerified){
        throw ApiError.forbidden("please verify your email before loggin")
    }

    const accessToken = generateAccessToken({id: user._id, role: user.role});

    const refreshToken = generateRefreshToken({id: user._id})

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

    const accessToken = generateAccessToken({ id: user._id, role: user.role })
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
    if(!user) throw ApiError.notFound("no account with that email");

    const { rawToken, hashedToken } = generateRestToken();
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    return rawToken;
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

const verifyEmail = async(token) => {
    const tokenHash = hashToken(token);
    const user = await User.findOne({verificationToken: tokenHash}).select("+verificationToken");

    if(!user) throw ApiError.notFound("Invalid or expired verification token");

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    return user;
}


const getMe = async(userId) => {
    const user = await User.findById(userId);
    if(!user) throw ApiError.notFound("User not found");
    return user;
}



export { 
    register,
     login, 
     refresh, 
     logout, 
     forgotPassword, 
    resetPassword,
     verifyEmail, 
     getMe 
}