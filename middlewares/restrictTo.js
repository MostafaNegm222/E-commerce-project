const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");


const restrictTo = (...roles) => catchAsync(async (req,res,next) => {
    const role = req.user.role
    if(roles.includes(role)) {
        next()
    } else {
        throw new AppError(`This route is protected, you are can't access it`,403)
    }
})