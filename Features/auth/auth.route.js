const { signup, confirmEmail, resendOTP } = require("./auth.controller")

const router = require("express").Router()

router.route("/signup").post(signup)
router.route("/confirm-email").post(confirmEmail)
router.route("/resend-otp").post(resendOTP)


module.exports = router