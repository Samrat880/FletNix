
import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 50,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        required: [true, "email is required"]
    },
    password: {
        type: String,
        trim: true,
        minlength: 6,
        maxlength: 50,
        select: false,
        required: [true, "password is required"]
    },

    role :{ 
        type: String,
        enum: ["customer", "seller", "admin"],
        default: "customer"
    },
    isVerified: {
        type: Boolean,
        default: false,
    },

    verificationToken : { type: String, select: false},
    refreshToken : { type: String, select: false},
    resetPasswordToken : { type: String, select: false},
    resetPasswordExpires : { type: Date, select: false},



}, {timestamps: true})


userSchema.pre('save', async function(){
    if(!this.isModified("password")) return;

        this.password = await bcrypt.hash(this.password, 12)
    next();
});

userSchema.methods.comparePassword = async function(clearTextPassword){
    return await bcrypt.compare(clearTextPassword, this.password)
}

export default mongoose.model("User", userSchema)