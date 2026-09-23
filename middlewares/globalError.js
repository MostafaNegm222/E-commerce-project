const AppError = require("../utils/AppError")

const globalError = (err,req,res,next) => {
    let error = err 
    console.log(err);
    if (error.kind == 'ObjectId') error = new AppError(`Invalid mongo id It must be 24 Characters`,400)
    if (error.code === 11000) {
        let message = `Duplicated key in Field ${Object.entries(error.keyValue)[0][0]} and the duplicated Value is ${Object.entries(error.keyValue)[0][1]}`
        error = new AppError(message,400)
    }
    if (error.name === "ValidationError") {
        let message = Object.values(error.errors).map(err => err.message).join(", ").replaceAll("Path " , "")
        error = new AppError(message,400)
    }
    
    if(error.name === 'TokenExpiredError') error = new AppError(`Token Expired, Please login again`)
    if(error.name === 'JsonWebTokenError') error = new AppError(`This token is invalid, Please try to login again`)
    if (process.env.NODE_ENV === "PRODUCTION") {
        res.status(error.status || 500).json({
            success : false ,
            message : error.message || 'Internal Server Error'
        })
    } else {
        res.status(error.status || 500).json({
            success : false ,
            message : error.message || 'Internal Server Error',
            stack : error.stack
        })
    }
}


module.exports = globalError