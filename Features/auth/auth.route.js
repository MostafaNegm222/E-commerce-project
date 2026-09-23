const { uploadTo } = require("../../config/cloudinary")
const auth = require("../../middlewares/authMiddleware")
const { getMe, updateProfile, deleteAccount } = require("../users/users.controller")
const { signup, confirmEmail, resendOTP, login, forgetPassword, resetPassword, logout} = require("./auth.controller")

const router = require("express").Router()

router.use("/me",auth) 
router.route("/me").get(getMe).patch(updateProfile).delete(deleteAccount)
router.route("/me/logout").post(logout)

router.route("/signup").post(uploadTo('users').single("image"),signup)
router.route("/confirm-email").post(confirmEmail)
router.route("/resend-otp").post(resendOTP)
router.route("/login").post(login)
router.route("/forget-password").post(forgetPassword)
router.route("/reset-password/:token").post(resetPassword)


module.exports = router