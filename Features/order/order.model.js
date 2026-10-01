const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        color: String,
        size: String,
        price: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      details: { type: String, required: [true, "Street address is required"] },
      phone: { type: String, required: [true, "Phone number is required"] },
      city: { type: String, required: [true, "City is required"] },
      postalCode: String,
    },
    paymentMethodType: {
      type: String,
      enum: ["card", "cash"],
      default: "cash",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
    totalOrderPrice: {
      type: Number,
      required: true,
    },
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

orderSchema.pre(/^find/, function () {
  this.populate({
    path: "user",
    select: "name email phone",
  }).populate({
    path: "cartItems.product",
    select: "title coverImage slug",
  });
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
