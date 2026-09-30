const catchAsync = require('../../utils/catchAsync');
const CategoryService = require('./category.service');

exports.getAllCategories = catchAsync(async (req, res) => {
  const { categories, categoriesCount } = await CategoryService.getAllCategories(req.query);

  res.status(200).json({
    success: true,
    results: categories.length,
    categoriesCount,
    data: categories,
  });
});

exports.getCategory = catchAsync(async (req, res) => {
  const category = await CategoryService.getCategoryById(req.params.id);

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.createCategory = catchAsync(async (req, res) => {
  const category = await CategoryService.createCategory(req.body, req.file);

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category,
  });
});

exports.updateCategory = catchAsync(async (req, res) => {
  const category = await CategoryService.updateCategory(
    req.params.id,
    req.body,
    req.file
  );

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
});

exports.softDeleteCategory = catchAsync(async (req, res) => {
  await CategoryService.softDeleteCategory(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Category soft deleted successfully',
  });
});

exports.deleteCategory = catchAsync(async (req, res) => {
  await CategoryService.deleteCategoryPermanently(req.params.id);

  res.status(204).send();
});