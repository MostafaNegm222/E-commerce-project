const catchAsync = require("../../../utils/catchAsync");
const AdminUsersService = require("./admin-users.service");

exports.getAllUsers = catchAsync(async (req, res) => {
  const { users, usersCount } = await AdminUsersService.getAllUsers(req.query);
  res.status(200).json({
    success: true,
    usersCount,
    data: users,
  });
});

exports.getDeletedUsers = catchAsync(async (req, res) => {
  const { users, usersCount } = await AdminUsersService.getDeletedUsers(
    req.query,
  );
  res.status(200).json({
    success: true,
    usersCount,
    data: users,
  });
});

exports.getOneUser = catchAsync(async (req, res) => {
  const user = await AdminUsersService.getOneUser(req.params.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.createUser = catchAsync(async (req, res) => {
  const user = await AdminUsersService.createUser(req.body);
  res.status(201).json({
    success: true,
    message: `User is Created successfully`,
    data: user,
  });
});

exports.updateUserRole = catchAsync(async (req, res) => {
  const user = await AdminUsersService.updateUserRole(req.params.id, req.body.role);
  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.softDeleteUser = catchAsync(async (req, res) => {
  const user = await AdminUsersService.softDeleteUser(req.params.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.restoreUser = catchAsync(async (req, res) => {
  const user = await AdminUsersService.restoreUser(req.params.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.deleteUser = catchAsync(async (req, res) => {
  await AdminUsersService.deleteUser(req.params.id);
  res.status(204).send();
});
