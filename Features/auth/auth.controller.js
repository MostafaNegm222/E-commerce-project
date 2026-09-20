const catchAsync = require("../../utils/catchAsync");
const AuthService = require("./auth.services");



exports.signup = catchAsync(async (req,res) => {
    const user = await AuthService.signup(req.body)
    res.status(201).json({
        success : true ,
        message : 'User is created successfully',
        data : user
    })
})