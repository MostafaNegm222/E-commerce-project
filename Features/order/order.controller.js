const catchAsync = require('../../utils/catchAsync');
const OrderService = require('./order.service');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
exports.createCashOrder = catchAsync(async (req, res) => {
  const { shippingAddress } = req.body;
  const order = await OrderService.createCashOrder(req.user._id, shippingAddress);

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: order,
  });
});

exports.getLoggedUserOrders = catchAsync(async (req, res) => {
  const orders = await OrderService.getUserOrders(
    req.user._id,
    req.query,
    req.user.role
  );

  res.status(200).json({
    success: true,
    results: orders.length,
    data: orders,
  });
});

exports.getOrder = catchAsync(async (req, res) => {
  const order = await OrderService.getOrderById(
    req.params.id,
    req.user._id,
    req.user.role
  );

  res.status(200).json({
    success: true,
    data: order,
  });
});

exports.updateOrderToPaid = catchAsync(async (req, res) => {
  const order = await OrderService.updateOrderToPaid(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Order status updated to paid',
    data: order,
  });
});

exports.updateOrderToDelivered = catchAsync(async (req, res) => {
  const order = await OrderService.updateOrderToDelivered(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Order status updated to delivered',
    data: order,
  });
});

exports.updateOrderStatus = catchAsync(async (req, res) => {
  const order = await OrderService.updateOrderStatus(req.params.id,req.body);
  res.status(200).json({
    success: true,
    message: `Order status updated to delivered ${order.status}`,
    data: order,
  });
});

exports.getCheckoutSession = catchAsync(async (req, res) => {
  const { shippingAddress } = req.body;
  const session = await OrderService.createCheckoutSession(
    req.user._id,
    shippingAddress,
    req
  );

  res.status(200).json({
    success: true,
    session,
  });
});


exports.webhookCheckout = catchAsync(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await OrderService.createCardOrder(session);
  }

  res.status(200).json({ received: true });
});