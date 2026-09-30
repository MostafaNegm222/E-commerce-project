const Cart = require('./cart.model');
const Product = require('../products/products.model');
const AppError = require('../../utils/AppError');

class CartService {
  static async getUserCart(userId) {
    let cart = await Cart.findOne({ user: userId }).populate({
      path: 'cartItems.product',
      select: 'title coverImage price slug stock',
    });
    if (!cart) {
      cart = await Cart.create({ user: userId, cartItems: [] });
    }
    return cart;
  }

  static async addProductToCart(userId, { productId, color, size }) {
    const product = await Product.findById(productId);
    if (!product) throw new AppError('Product not found', 404);
    if (product.stock < 1) {
      throw new AppError('Product is out of stock', 400);
    }
    const productPrice = product.priceAfterDiscount || product.price;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        cartItems: [
          {
            product: productId,
            color,
            size,
            price: productPrice,
            quantity: 1,
          },
        ],
      });
      return cart;
    }
    const itemIndex = cart.cartItems.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.color === color &&
        item.size === size
    );

    if (itemIndex > -1) {
      const item = cart.cartItems[itemIndex];
      if (item.quantity + 1 > product.stock) {
        throw new AppError(`Cannot add more than available stock (${product.stock})`, 400);
      }
      item.quantity += 1;
    } else {
      cart.cartItems.push({
        product: productId,
        color,
        size,
        price: productPrice,
        quantity: 1,
      });
    }
    await cart.save();
    return cart;
  }

  static async updateCartItemQuantity(userId, productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) throw new AppError('Product not found', 404);

    if (quantity > product.stock) {
      throw new AppError(`Quantity exceeds available stock (${product.stock})`, 400);
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new AppError('Cart not found', 404);

    const itemIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      throw new AppError('Item not found in cart', 404);
    }

    cart.cartItems[itemIndex].quantity = quantity;
    await cart.save();

    return cart;
  }

  static async removeCartItem(userId, productId) {
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { cartItems: { product: productId } } },
      { returnDocument :"after"}
    );

    if (!cart) throw new AppError('Cart not found', 404);
    await cart.save();
    return cart;
  }

  static async clearCart(userId) {
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { cartItems: [], totalCartPrice: 0, totalPriceAfterDiscount: undefined },
      { returnDocument :"after"}
    );

    return cart;
  }
}

module.exports = CartService;