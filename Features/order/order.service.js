const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('./order.model');
const Cart = require('../cart/cart.model');
const Product = require('../products/product.model');
const AppError = require('../../utils/AppError');
const ApiFeatures = require('../../utils/ApiFeatures');
const User = require('../users/users.model');

class OrderService {
  static async createCashOrder(userId, shippingAddress) {
    const taxPrice = 0;
    const shippingPrice = 0; 

    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.cartItems.length === 0) {
      throw new AppError('Your cart is empty', 400);
    }

    const cartPrice = cart.totalPriceAfterDiscount
      ? cart.totalPriceAfterDiscount
      : cart.totalCartPrice;

    const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

    const order = await Order.create({
      user: userId,
      cartItems: cart.cartItems,
      shippingAddress,
      totalOrderPrice,
      taxPrice,
      shippingPrice,
      paymentMethodType: 'cash',
      isPaid: false,
    });

    if (order) {
      const bulkOptions = cart.cartItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: {
            $inc: { stock: -item.quantity, sold: +item.quantity },
          },
        },
      }));

      await Product.bulkWrite(bulkOptions);
      await Cart.findByIdAndDelete(cart._id);
    }

    return order;
  }

  static async getUserOrders(userId, query, userRole) {
    let filter = {};
    if (userRole !== 'admin') {
      filter.user = userId;
    }

    const features = new ApiFeatures(Order.find(filter), query)
      .filter()
      .sort()
      .pagination();

    const orders = await features.query;
    return orders;
  }

  static async getOrderById(orderId, userId, userRole) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError(`Order not found with ID: ${orderId}`, 404);
    }

    if (userRole !== 'admin' && order.user._id.toString() !== userId.toString()) {
      throw new AppError('You are not authorized to view this order', 403);
    }

    return order;
  }

  static async updateOrderToPaid(orderId) {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);

    order.isPaid = true;
    order.paidAt = Date.now();

    const updatedOrder = await order.save();
    return updatedOrder;
  }

  static async updateOrderToDelivered(orderId) {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered';

    const updatedOrder = await order.save();
    return updatedOrder;
  }

  static async updateOrderStatus(orderId,body) {
    const {status} = body;
    if (!status) throw new AppError('Status is required', 400);
    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);
    order.status = status;
    const updatedOrder = await order.save();
    return updatedOrder;
  }

  
  static async createCheckoutSession(userId, shippingAddress, req) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.cartItems.length === 0) {
      throw new AppError('Your cart is empty', 400);
    }

    const cartPrice = cart.totalPriceAfterDiscount
      ? cart.totalPriceAfterDiscount
      : cart.totalCartPrice;

    const totalOrderPrice = cartPrice;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'egp',
            unit_amount: Math.round(totalOrderPrice * 100),
            product_data: {
              name: `Order for ${req.user.name}`,
              description: 'E-commerce Purchase',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: req.user.email,
      client_reference_id: cart._id.toString(),
      metadata: {
        shippingAddress: JSON.stringify(shippingAddress),
        userId: userId.toString(),
      },
      success_url: `${req.protocol}://${req.get('host')}/order/success`,
      cancel_url: `${req.protocol}://${req.get('host')}/cart`,
    });

    return session;
  }

  static async createCardOrder(session) {
    const cartId = session.client_reference_id;
    const shippingAddress = JSON.parse(session.metadata.shippingAddress);
    const userId = session.metadata.userId;
    const totalOrderPrice = session.amount_total / 100;
    const stripeSessionId = session.id;
    
    const existingOrder = await Order.findOne({ stripeSessionId });
      if (existingOrder) {
        return existingOrder;
      }
    const cart = await Cart.findById(cartId);
    const user = await User.findById(userId);

    if (!cart || !user) return;


    const order = await Order.create({
      user: userId,
      cartItems: cart.cartItems,
      shippingAddress,
      totalOrderPrice,
      stripeSessionId,
      paymentMethodType: 'card',
      isPaid: true,
      paidAt: Date.now(),
    });

    if (order) {
      const bulkOptions = cart.cartItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: -item.quantity, sold: +item.quantity } },
        },
      }));
      await Product.bulkWrite(bulkOptions);
      await Cart.findByIdAndDelete(cartId);
    }
  }


}

module.exports = OrderService;