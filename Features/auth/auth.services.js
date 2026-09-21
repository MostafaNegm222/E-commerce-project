const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const {customAlphabet} = require("nanoid")
const {promisify} = require("util")
const AppError = require("../../utils/AppError")
const User = require("../users/users.model")
const sendEmail = require("../../utils/sendEmail")

const jwtSign = promisify(jwt.sign)

class AuthService {

    static findUser(filter) {
        return User.findOne(filter)
    }

    static async signup (data) {
        const {email,name,password,phone=""} = data
        const userExisting = await this.findUser({email})
        if(userExisting) throw new AppError(`This email is already exist, please try another email`,400)
        const user  = await User.create({email,name,image,phone,password})
        sendEmail(user.email,'Confirm Email',user._plainOTP,user.name)
        return user
    }

    static async confirmEmail(data) {
        const {email,confirmOTP} = data;
        if (!email || !confirmOTP) {
            throw new AppError('Email and OTP are required', 400);
        }
        const userExisting = await User.findOne({ email }).select('+confirmOTP +OTPExpired');
        if (!userExisting) {
            throw new AppError("This user doesn't exist, please signup first!", 400);
        }
        if (userExisting.isConfirmed) {
            throw new AppError('This user is already confirmed/active', 400);
        }
        if (!userExisting.OTPExpired || userExisting.OTPExpired < Date.now()) {
            throw new AppError('OTP code has expired, please request a new one', 400);
        }
        const isOTPValid = await bcrypt.compare(confirmOTP, userExisting.confirmOTP);
        if (!isOTPValid) {
            throw new AppError('Invalid OTP code', 400);
        }
        userExisting.isConfirmed = true;
        userExisting.confirmOTP = undefined;
        userExisting.OTPExpired = undefined;
        await userExisting.save();
        return 'Email is confirmed successfully. Please login!';
    }

    static async resendOTP(data) {
        const { email } = data;
        if (!email) {
            throw new AppError('Email is required', 400);
        }
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError("This user doesn't exist, please signup first!", 400);
        }
        if (user.isConfirmed) {
            throw new AppError('This account is already confirmed and active', 400);
        }
        if (user.OTPExpired && (user.OTPExpired - Date.now() > 9 * 60 * 1000)) {
        throw new AppError('Please wait a minute before requesting a new OTP', 400);
        }
        const newOTP = customAlphabet('0123456789', 6)();
        const hashedOTP = await bcrypt.hash(newOTP, +process.env.SALT_ROUND || 10);
        user.confirmOTP = hashedOTP;
        user.OTPExpired = Date.now() + 10 * 60 * 1000;
        await user.save();
        await sendEmail(user.email, 'New Confirmation OTP', newOTP, user.name);
        return 'A new OTP has been sent to your email!';
    }

    static async login (data) {
        const {email,password} = data 
        const userExisting = await this.findUser({email}).select("+password")
        if(!userExisting) throw new AppError(`Invalid Credential`,400)
        if(!userExisting.isConfirmed) throw new AppError(`This email isn't active, Please confirm email first !`,400)
        const check = await userExisting.comparePassword(password)
        if(!check) throw new AppError(`Invalid Credential`,400)
        const token = await jwtSign({_id:userExisting._id,role:userExisting.role},process.env.SECRET_KEY,{expiresIn:"7d"})
        userExisting.isActive = true 
        userExisting.lastSeen = new Date()
        await userExisting.save({validateBeforeSave : false})
        return token
    }

    static async forgetPassword (data) {
        const {email} = data
        const userExisting = await this.findUser({email})
        if(!userExisting) throw new AppError(`This email isn't exist, please signup`,400)
        const resetToken = await crypto.randomBytes(32).toString("hex") 
        userExisting.resetToken = resetToken 
        userExisting.resetTokenExpired = Date.now() + 10 * 60 * 1000
        await userExisting.save({validateBeforeSave:false})
        const link = `${process.env.FRONTEND_LINK ? process.env.FRONTEND_LINK : `http://localhost:3000`}/auth/reset-token/${resetToken}`
        await sendEmail(email,"Reset Password",link,userExisting.name)
        return `Reset link send to your email`
    }

    static async resetPassword (params,body) {
        const {token} = params 
        const {password} = body 
        const userExisting = await this.findUser({resetToken:token})
        if(!userExisting || userExisting.resetTokenExpired < Date.now()) throw new AppError(`This token is invalid or Expired`,400)
        if(password.length == 6) throw new AppError(`Password must be 6 characters or more`,400)
        userExisting.password = password 
        await userExisting.save({validateBeforeSave:false})
        return `Password reset successfully, Please login !`
    }
}



module.exports = AuthService