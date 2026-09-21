const { signup, confirmEmail, resendOTP, login, forgetPassword, resetPassword } = require("./auth.controller")

const router = require("express").Router()

router.route("/signup").post(signup)
router.route("/confirm-email").post(confirmEmail)
router.route("/resend-otp").post(resendOTP)
router.route("/login").post(login)
router.route("/forget-password").post(forgetPassword)
router.route("/reset-password/:token").post(resetPassword)


module.exports = router