const jwt = require("jsonwebtoken");
const User = require("../Features/users/users.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const auth = catchAsync(async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
        throw new AppError("You are not authenticated, please login first!", 401);
    }
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
        throw new AppError("Invalid token format", 401);
    }
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decode.id || decode._id);
    if (!user) {
        throw new AppError("The user belonging to this token no longer exists", 401);
    }
    req.user = user;
    next();
});

module.exports = auth;