const { cloudinary } = require("../../config/cloudinary");
const ApiFeatures = require("../../utils/ApiFeatures");
const AppError = require("../../utils/AppError");
const Product = require("./product.model");

class ProductService {
  static async getAllProducts(query) {
    const features = new ApiFeatures(Product.find(), query)
      .filter()
      .search()
      .sort()
      .fields()
      .pagination();
    const products = await features.query;
    const productsCount = await Product.countDocuments({
      isDeleted: false,
      ...features.filterQuery,
      ...features.searchQuery,
    });
    return { products, productsCount, results: products.length };
  }

  static async getDeletedProducts(query) {
    const features = new ApiFeatures(Product.find({ isDeleted: true }), query)
      .filter()
      .search()
      .sort()
      .fields()
      .pagination();
    const products = await features.query;
    const productsCount = await Product.countDocuments({
      isDeleted: true,
      ...features.filterQuery,
      ...features.searchQuery,
    });
    return { products, productsCount, results: products.length };
  }

  static async getStatus() {
    const status = await Product.aggregate([
      { $match: { isDeleted: false } },
      { $sort: { price: -1 } },
      {
        $group: {
          _id: "$category",
          productCount: { $sum: 1 },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          avgPrice: { $avg: "$price" },
          mostExpensiveProduct: { $first: "$$ROOT" },
        },
      },
    ]);
    return status;
  }

  static async getOneProduct(id) {
    const product = await Product.findById(id).populate("category");
    if (!product)
      throw new AppError(`No product found with this id ${id}`, 404);
    return product;
  }

  static async createProduct(body, files) {
    if (!files || !files.coverImage) {
      if (files?.images) await this.rollbackUploadedFiles(files);
      throw new AppError("Product cover image is required", 400);
    }
    try {
      const coverImageData = {
        url: files.coverImage[0].path,
        public_id: files.coverImage[0].filename,
      };

      const imagesData = files.images
        ? files.images.map((file) => ({
            url: file.path,
            public_id: file.filename,
          }))
        : [];

      const product = await Product.create({
        ...body,
        coverImage: coverImageData,
        images: imagesData,
      });

      return product;
    } catch (error) {
      await this.rollbackUploadedFiles(files);
      throw error;
    }
  }

  static async updateProduct(id, body, files) {
    const product = await Product.findById(id);
    if (!product) throw new AppError(`No product found with ID: ${id}`, 404);
    const updateData = { ...body };
    const oldPublicIdsToDelete = [];
    if (files && files.coverImage) {
      if (product.coverImage && product.coverImage.public_id) {
        oldPublicIdsToDelete.push(product.coverImage.public_id);
      }
      updateData.coverImage = {
        url: files.coverImage[0].path,
        public_id: files.coverImage[0].filename,
      };
    }

    if (files && files.images) {
      if (product.images && product.images.length > 0) {
        product.images.forEach((img) =>
          oldPublicIdsToDelete.push(img.public_id),
        );
      }
      updateData.images = files.images.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    try {
      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
        returnDocument: "after",
        runValidators: true,
      });
      if (oldPublicIdsToDelete.length > 0) {
        const deletePromises = oldPublicIdsToDelete.map((public_id) =>
          cloudinary.uploader.destroy(public_id),
        );
        await Promise.all(deletePromises);
      }
      return updatedProduct;
    } catch (error) {
      await this.rollbackUploadedFiles(files);
      throw error;
    }
  }

  static async softDeleteProduct(id) {
    const product = await Product.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { returnDocument: "after" },
    );
    if (!product) throw new AppError(`No product found with ID: ${id}`, 404);
    return product;
  }

  static async deleteProduct(id) {
    const product = await Product.findById(id);
    if (!product) throw new AppError(`No product found with ID: ${id}`, 404);
    if (product.coverImage && product.coverImage.public_id)
      await cloudinary.uploader.destroy(product.coverImage.public_id);
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((image) => {
        cloudinary.uploader.destroy(image.public_id);
      });
      await Promise.all(deletePromises);
    }
    await product.deleteOne();
    return `Product deleted successfully`;
  }

  static async rollbackUploadedFiles(files) {
    if (!files) return;
    const deletePromises = [];
    if (files.coverImage && files.coverImage[0]?.filename) {
      deletePromises.push(
        cloudinary.uploader.destroy(files.coverImage[0].filename),
      );
    }
    if (files.images && files.images.length > 0) {
      files.images.forEach((file) => {
        deletePromises.push(cloudinary.uploader.destroy(file.filename));
      });
    }
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }
  }
}

module.exports = ProductService;
