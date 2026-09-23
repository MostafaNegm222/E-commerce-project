const catchAsync = require("../../utils/catchAsync");
const AdminUsersService = require("./admin-users/admin-users.service");
const UsersService = require("./users.services");

exports.updateProfile = catchAsync(async (req,res) => {
    const data = await UsersService.updateProfile(req.user._id,req.body,req.file)
    res.status(200).json({
        success : true ,
        data
    })
})

exports.getMe = catchAsync((req,res) => {
    res.status(200).json({
        success : true ,
        data : req.user
    })
})

exports.deleteAccount = catchAsync(async (req,res) => {
    await AdminUsersService.deleteUser(req.user._id)
    res.status(204).send()
})
