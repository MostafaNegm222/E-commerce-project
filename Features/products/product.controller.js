const catchAsync = require("../../utils/catchAsync");
const ProductService = require("./product.service");

exports.getAllProducts = catchAsync(async (req, res) => {
  const { products, productsCount, results } =
    await ProductService.getAllProducts(req.query);
  res.status(200).json({
    success: true,
    results,
    productsCount,
    data: products,
  });
});

exports.getDeletedProducts = catchAsync(async (req, res) => {
  const { products, productsCount, results } =
    await ProductService.getDeletedProducts(req.query);
  res.status(200).json({
    success: true,
    results,
    productsCount,
    data: products,
  });
});

exports.getStatus = catchAsync(async (req, res) => {
  const status = await ProductService.getStatus();
  res.status(200).json({
    success: true,
    data: status,
  });
});

exports.getOneProduct = catchAsync(async (req, res) => {
  const product = await ProductService.getOneProduct(req.params.id);
  res.status(200).json({
    success: true,
    data: product,
  });
});

exports.getProductBySlug = catchAsync(async (req, res) => {
  const product = await ProductService.getProductBySlug(req.params.slug);
  res.status(200).json({
    success: true,
    data: product,
  });
});

exports.getRelatedProducts = catchAsync(async (req, res) => {
  const products = await ProductService.getRelatedProducts(req.params.id);
  res.status(200).json({
    success: true,
    results: products.length,
    data: products,
  });
});

exports.createProduct = catchAsync(async (req, res) => {
  const product = await ProductService.createProduct(req.body, req.files);
  res.status(201).json({
    success: true,
    message: "Product is added successfully",
    data: product,
  });
});

exports.updateProduct = catchAsync(async (req, res) => {
  const product = await ProductService.updateProduct(
    req.params.id,
    req.body,
    req.files,
  );
  res.status(200).json({
    success: true,
    message: "Product is updated successfully",
    data: product,
  });
});

exports.softDeleteProduct = catchAsync(async (req, res) => {
  const product = await ProductService.softDeleteProduct(req.params.id);
  res.status(200).json({
    success: true,
    message: "Product is Deleted successfully",
    data: product,
  });
});

exports.deleteProduct = catchAsync(async (req, res) => {
  await ProductService.deleteProduct(req.params.id);
  res.status(204).send();
});
