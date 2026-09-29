const { getAllProducts, getDeletedProducts, getStatus, getOneProduct } = require('./product.controller')

const router = require('express').Router()

router.route("/").get(getAllProducts)
router.route('/deleted-products').get(getDeletedProducts)
router.route('/status').get(getStatus)
router.route('/:id').get(getOneProduct)


module.exports = router