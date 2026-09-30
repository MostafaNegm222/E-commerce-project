const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Cart item must belong to a product'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity cannot be less than 1'],
      default: 1,
    },
    color: String,
    size: String,
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false } 
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cart must belong to a user'],
      unique: true, 
    },
    cartItems: [cartItemSchema],
    totalCartPrice: {
      type: Number,
      default: 0,
    },
    totalPriceAfterDiscount: Number, 
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

cartSchema.pre('save', function () {
  this.totalCartPrice = this.cartItems.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);
  if (this.cartItems.length === 0) {
    this.totalPriceAfterDiscount = undefined;
  }
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;