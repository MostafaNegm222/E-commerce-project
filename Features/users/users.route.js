const restrictTo = require('../../middlewares/restrictTo')
const auth = require('../../middlewares/authMiddleware')
const { getAllUsers, createUser, getOneUser, updateUserRole, deleteUser, getDeletedUsers, softDeleteUser, restoreUser } = require('./users.controller')

const router = require('express').Router()


router.use(auth,restrictTo('admin'))
router.route("/").get(getAllUsers).post(createUser)
router.route("/deleted-users").get(getDeletedUsers)
router.route("/:id").get(getOneUser).patch(updateUserRole).delete(deleteUser)
router.route("/:id/soft-delete").patch(softDeleteUser)
router.route("/:id/restore-user").patch(restoreUser)

module.exports = router