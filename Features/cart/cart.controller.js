const catchAsync = require("../../utils/catchAsync");
const CartService = require("./cart.service");

exports.getLoggedUserCart = catchAsync(async (req, res) => {
  const cart = await CartService.getUserCart(req.user._id);

  res.status(200).json({
    success: true,
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

exports.addProductToCart = catchAsync(async (req, res) => {
  const cart = await CartService.addProductToCart(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: "Product added to cart successfully",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

exports.updateCartItemQuantity = catchAsync(async (req, res) => {
  const { quantity } = req.body;
  const cart = await CartService.updateCartItemQuantity(
    req.user._id,
    req.params.productId,
    quantity,
  );

  res.status(200).json({
    success: true,
    message: "Cart updated successfully",
    data: cart,
  });
});

exports.removeCartItem = catchAsync(async (req, res) => {
  const cart = await CartService.removeCartItem(
    req.user._id,
    req.params.productId,
  );

  res.status(200).json({
    success: true,
    message: "Item removed successfully",
    data: cart,
  });
});

exports.clearCart = catchAsync(async (req, res) => {
  await CartService.clearCart(req.user._id);

  res.status(204).send();
});
