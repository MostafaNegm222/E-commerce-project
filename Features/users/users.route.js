const restrictTo = require("../../middlewares/restrictTo");
const auth = require("../../middlewares/authMiddleware");
const {
  getAllUsers,
  createUser,
  getOneUser,
  updateUserRole,
  deleteUser,
  getDeletedUsers,
  softDeleteUser,
  restoreUser,
} = require("./admin-users/admin-users.controller");
const { uploadTo } = require("../../config/cloudinary");

const router = require("express").Router();

router.use(auth, restrictTo("admin"));
router
  .route("/")
  .get(getAllUsers)
  .post(uploadTo("users").single("image"), createUser);
router.route("/deleted-users").get(getDeletedUsers);
router.route("/:id").get(getOneUser).patch(updateUserRole).delete(deleteUser);
router.route("/:id/soft-delete").patch(softDeleteUser);
router.route("/:id/restore-user").patch(restoreUser);

module.exports = router;
