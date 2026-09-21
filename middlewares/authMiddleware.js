const jwt = require("jsonwebtoken")
const User = require("../Features/users/users.model")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/AppError")

const auth = catchAsync(async (req,res,next) => {
    if (req.header.authorization) {
        const token = req.header.authorization.split(" ")[1]
        const decode = jwt.verify(token,process.env.SECRET_KEY)
        const user = await User.findById(decode._id)
        req.user = user
        next()
    } else {
        throw new AppError(`You are not authenticated, Please login first`,401)
    }
})

module.exports = auth