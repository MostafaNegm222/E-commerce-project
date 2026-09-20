const AppError = require("../utils/AppError")

const globalError = (err,req,res,next) => {
    const error = err 
    console.log(err);
    if (error.kind == 'ObjectId') error = new AppError(400,`Invalid mongo id It must be 24 Characters`)
    if (error.code === 11000) {
        let message = Object.entries(error.keyValue)
        console.log(message);
    }

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