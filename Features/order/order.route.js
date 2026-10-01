const router = require('express').Router();
const orderController = require('./order.controller');
const auth = require('../../middlewares/authMiddleware');
const restrictTo = require('../../middlewares/restrictTo');

router.use(auth);

router.post('/checkout-session', auth, orderController.getCheckoutSession);

router.post('/checkout-cash', orderController.createCashOrder);
router.get('/', orderController.getLoggedUserOrders);
router.get('/:id', orderController.getOrder);

router.patch('/:id/pay', restrictTo('admin'), orderController.updateOrderToPaid);
router.patch('/:id/deliver', restrictTo('admin'), orderController.updateOrderToDelivered);
router.patch('/:id/status', restrictTo('admin'), orderController.updateOrderStatus);

module.exports = router; 