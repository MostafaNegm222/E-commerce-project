const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
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
        console.log(data);
        const {email,name,password,phone=""} = data
        const findUser = await this.findUser({email})
        console.log(findUser);
        if(findUser) throw new AppError(400,`This email is already exist, please try another email`)
        const user  = await User.create({email,name,image,phone,password})
        sendEmail(user.email,'Confirm Email',user._plainOTP,user.name)
        return user
    }
}



module.exports = AuthService