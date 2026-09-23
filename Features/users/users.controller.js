const catchAsync = require("../../utils/catchAsync");
const UsersService = require("./users.services");


exports.getAllUsers = catchAsync(async (req,res) => {
    const {users , usersCount} = await UsersService.getAllUsers(req.query)
    res.status(200).json({
        success:true ,
        usersCount,
        data : users
    })
})

exports.getDeletedUsers = catchAsync(async (req,res) => {
    const {users,usersCount} = await UsersService.getDeletedUsers(req.query)
    res.status(200).json({
        success:true ,
        usersCount,
        data : users
    })
})

exports.getOneUser = catchAsync(async (req,res) => {
    const user = await UsersService.getOneUser()
    res.status(200).json({
        success : true ,
        data : user
    })
})

exports.createUser = catchAsync(async (req,res) => {
    const user = await UsersService.createUser(req.body)
    res.status(201).json({
        success :true ,
        message : `User is Created successfully`,
        data : user
    })
})

exports.updateUserRole = catchAsync(async (req,res) => {
    const user = await UsersService.updateUserRole(req.params.id,req.body)
    res.status(200).json({
        success : true ,
        data : user
    })
})

exports.softDeleteUser = catchAsync(async (req,res) => {
    const user = await UsersService.softDeleteUser(req.params.id)
    res.status(200).json({
        success : true ,
        data : user
    })
})

exports.restoreUser = catchAsync(async (req,res) => {
    const user = await UsersService.restoreUser(req.params.id)
    res.status(200).json({
        success : true ,
        data : user
    })
})

exports.deleteUser = catchAsync(async (req,res) => {
    await UsersService.deleteUser(req.params.id)
    res.status(204).send()
})

