const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const {customAlphabet} = require("nanoid")
const {promisify} = require("util")
const AppError = require("../../utils/AppError")
const User = require("../users/users.model")
const sendEmail = require("../../utils/sendEmail")
const { OAuth2Client } = require("google-auth-library")
const client = new OAuth2Client(process.env.CLIENT_ID)


const jwtSign = promisify(jwt.sign)

class AuthService {

    static findUser(filter) {
        return User.findOne(filter)
    }

    static updateImage (file) {
        if (!file) {
            throw new AppError(`Please upload an image file`, 400)
        }
        return {
            url : file.path ,
            public_id : file.filename 
        }
    }

    static async signup (data,file) {
        const {email,name,password,phone=""} = data
        const userExisting = await this.findUser({email})
        if(userExisting) throw new AppError(`This email is already exist, please try another email`,400)
        const OTP  = customAlphabet('0123456789',6)()
        const OTPExpired = Date.now() + 10 * 60 * 1000
        const confirmOTP = await bcrypt.hash(OTP,+process.env.SALT_ROUND)
        const userData = {
        email,
        name,
        password,
        phone,
        confirmOTP,
        OTPExpired
    };
        if (file) {
            userData.image = this.updateImage(file)
        }
        const user = await User.create(userData);
        await sendEmail(user.email,'Confirm Email',OTP,user.name)
        return user
    }

    static async confirmEmail(data) {
        const {email,confirmOTP} = data;
        if (!email || !confirmOTP) {
            throw new AppError('Email and OTP are required', 400);
        }
        const userExisting = await User.findOne({ email }).select('+confirmOTP +OTPExpired');
        if (!userExisting) {
            throw new AppError("This user doesn't exist, please signup first!", 404);
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
            throw new AppError("This user doesn't exist, please signup first!", 404);
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

    static async googleLogin (idToken) {
        if (!idToken) throw new AppError(`Google Id token is required`,400)
        const ticket = await client.verifyIdToken({idToken,audience:process.env.CLIENT_ID})
        const payload = ticket.getPayload()
        const {email,name,picture,sub:googleId} = payload
        let user = await this.findUser({email})
        if(!user) {
            user = await User.create({
                name,
                email,
                image : {
                    url:picture,
                    public_id:null
                },
                googleId ,
                isConfirmed:true,
                password : Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
            })
        }
        const token = await jwtSign({_id:user._id,role:user.role},process.env.SECRET_KEY,{"expiresIn":"7d"})
        user.isActive = true 
        user.lastSeen = new Date()
        await user.save({validateBeforeSave:false})
        return token
    }

    static async forgetPassword (data) {
        const {email} = data
        const userExisting = await this.findUser({email})
        if(!userExisting) throw new AppError(`This email isn't exist, please signup`,404)
        const resetToken = await crypto.randomBytes(32).toString("hex") 
        userExisting.resetToken = resetToken 
        userExisting.resetTokenExpired = Date.now() + 10 * 60 * 1000
        await userExisting.save({validateBeforeSave:false})
        const link = `${process.env.FRONTEND_LINK ? process.env.FRONTEND_LINK : `http://localhost:3000`}/auth/reset-password/${resetToken}`
        await sendEmail(email,"Reset Password",link,userExisting.name)
        return `Reset link send to your email`
    }

    static async resetPassword (params,body) {
        const {token} = params 
        const {password} = body 
        const userExisting = await this.findUser({resetToken:token})
        if(!userExisting || userExisting.resetTokenExpired < Date.now()) throw new AppError(`This token is invalid or Expired`,400)
        if(password.length < 6) throw new AppError(`Password must be 6 characters or more`,400)
        userExisting.password = password 
        userExisting.resetToken = undefined 
        userExisting.resetTokenExpired = undefined
        await userExisting.save({validateBeforeSave:false})
        return `Password reset successfully, Please login !`
    }

    

    static async logout (userId) {
        const user = await this.findUser({_id:userId})
        if(!user) throw new AppError(`This user is not found`,404)
        user.isActive = false 
        user.lastSeen = new Date()
        await user.save({validateBeforeSave:false})
        return `Logout is success`
    }
}



module.exports = AuthService