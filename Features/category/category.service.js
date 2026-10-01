const Category = require("./category.model");
const ApiFeatures = require("../../utils/ApiFeatures");
const AppError = require("../../utils/AppError");
const { cloudinary } = require("../../config/cloudinary");

class CategoryService {
  static async getAllCategories(query) {
    const features = new ApiFeatures(Category.find(), query)
      .filter()
      .search()
      .sort()
      .fields()
      .pagination();

    const categories = await features.query;
    const categoriesCount = await Category.countDocuments(features.filterQuery);

    return { categories, categoriesCount };
  }

  static async getCategoryById(id) {
    const category = await Category.findById(id);
    if (!category) {
      throw new AppError(`Category not found with ID: ${id}`, 404);
    }
    return category;
  }

  static async createCategory(body, file) {
    if (!file) {
      throw new AppError("Category image is required", 400);
    }

    try {
      const categoryData = {
        ...body,
        image: {
          url: file.path,
          public_id: file.filename,
        },
      };

      const category = await Category.create(categoryData);
      return category;
    } catch (error) {
      if (file && file.filename) {
        await cloudinary.uploader.destroy(file.filename);
      }
      throw error;
    }
  }

  static async updateCategory(id, body, file) {
    const category = await Category.findById(id);
    if (!category) throw new AppError(`Category not found with ID: ${id}`, 404);
    const updateData = { ...body };
    if (file) {
      updateData.image = {
        url: file.path,
        public_id: file.filename,
      };
    }

    try {
      const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
        returnDocument: "after",
        runValidators: true,
      });

      if (file && category.image && category.image.public_id) {
        await cloudinary.uploader.destroy(category.image.public_id);
      }

      return updatedCategory;
    } catch (error) {
      if (file && file.filename) {
        await cloudinary.uploader.destroy(file.filename);
      }
      throw error;
    }
  }

  static async softDeleteCategory(id) {
    const category = await Category.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { returnDocument: "after" },
    );
    if (!category) throw new AppError(`Category not found with ID: ${id}`, 404);
    return category;
  }

  static async deleteCategoryPermanently(id) {
    const category = await Category.findById(id);
    if (!category) throw new AppError(`Category not found with ID: ${id}`, 404);
    if (category.image && category.image.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id);
    }

    await category.deleteOne();
    return category;
  }
}

module.exports = CategoryService;
