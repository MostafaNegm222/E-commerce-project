jest.mock("../Features/cart/cart.model");
jest.mock("../Features/products/product.model");

const Cart = require("../Features/cart/cart.model");
const Product = require("../Features/products/product.model");
const CartService = require("../Features/cart/cart.service");

beforeEach(() => jest.resetAllMocks());

describe("CartService.addProductToCart", () => {
  test("404 when the product does not exist", async () => {
    Product.findById.mockResolvedValue(null);
    await expect(CartService.addProductToCart("u1", { productId: "p1" })).rejects.toMatchObject({ status: 404 });
  });

  test("400 when the product is out of stock", async () => {
    Product.findById.mockResolvedValue({ stock: 0, price: 10 });
    await expect(CartService.addProductToCart("u1", { productId: "p1" })).rejects.toMatchObject({ status: 400 });
  });

  test("creates a cart using the discounted price when there is one", async () => {
    Product.findById.mockResolvedValue({ stock: 5, price: 100, priceAfterDiscount: 80 });
    Cart.findOne.mockResolvedValue(null);
    Cart.create.mockImplementation(async (d) => d);
    const cart = await CartService.addProductToCart("u1", { productId: "p1", color: "red", size: "M" });
    expect(cart.cartItems).toEqual([{ product: "p1", color: "red", size: "M", price: 80, quantity: 1 }]);
  });

  test("refuses to go above the available stock for an item already in the cart", async () => {
    Product.findById.mockResolvedValue({ stock: 2, price: 10 });
    Cart.findOne.mockResolvedValue({
      cartItems: [{ product: "p1", color: "red", size: "M", quantity: 2 }],
      save: jest.fn(),
    });
    await expect(
      CartService.addProductToCart("u1", { productId: "p1", color: "red", size: "M" })
    ).rejects.toMatchObject({ status: 400 });
  });
});
