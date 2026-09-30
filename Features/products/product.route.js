const { uploadTo } = require('../../config/cloudinary')
const auth = require('../../middlewares/authMiddleware')
const restrictTo = require('../../middlewares/restrictTo')
const { getAllProducts, getDeletedProducts, getStatus, getOneProduct, createProduct, updateProduct, deleteProduct, softDeleteProduct } = require('./product.controller')

const router = require('express').Router()

const imageUpload = uploadTo('products').fields([
    {name : 'coverImage' , maxCount : 1},
    {name : 'images' , maxCount : 5},
])

router.route("/").get(getAllProducts)
router.route('/deleted-products').get(getDeletedProducts)
router.route('/status').get(getStatus)
router.route('/:id').get(getOneProduct)

router.use(auth,restrictTo('admin'))

router.route('/').post(imageUpload,createProduct)
router.route('/:id').patch(imageUpload,updateProduct).delete(deleteProduct)
router.route('/:id/soft-delete').patch(softDeleteProduct)


module.exports = router