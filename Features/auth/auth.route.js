const { signup, confirmEmail, resendOTP, login } = require("./auth.controller")

const router = require("express").Router()

router.route("/signup").post(signup)
router.route("/confirm-email").post(confirmEmail)
router.route("/resend-otp").post(resendOTP)
router.route("/login").post(login)


module.exports = router