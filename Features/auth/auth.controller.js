const catchAsync = require("../../utils/catchAsync");
const AuthService = require("./auth.services");



exports.signup = catchAsync(async (req,res) => {
    const user = await AuthService.signup(req.body)
    res.status(201).json({
        success : true ,
        message : 'User is created successfully, Please check your email',
        data : user
    })
})

exports.confirmEmail = catchAsync(async (req,res) => {
    const message = await AuthService.confirmEmail(req.body)
    res.status(200).json({
        success : true ,
        message
    })
})

exports.resendOTP = catchAsync(async (req,res) => {
    const message = await AuthService.resendOTP(req.body);
    res.status(200).json({
        success: true,
        message
    });
});

exports.login = catchAsync(async (req,res) => {
    const token = await AuthService.login(req.body)
    res.status(200).json({
        success : true ,
        token 
    })
})

exports.forgetPassword = catchAsync(async (req,res) => {
    const message = await AuthService.forgetPassword(req.body)
    res.status(200).json({
        success : true ,
        message
    })
})