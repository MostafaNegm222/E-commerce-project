const router = require('express').Router();
const cartController = require('./cart.controller');
const auth = require('../../middlewares/authMiddleware');

router.use(auth);

router
  .route('/')
  .get(cartController.getLoggedUserCart)
  .post(cartController.addProductToCart)
  .delete(cartController.clearCart);

router
  .route('/:productId')
  .patch(cartController.updateCartItemQuantity)
  .delete(cartController.removeCartItem);

module.exports = router;