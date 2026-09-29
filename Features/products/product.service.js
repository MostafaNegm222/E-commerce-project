const ApiFeatures = require("../../utils/ApiFeatures")
const AppError = require("../../utils/AppError")
const Product = require("./product.model")


class ProductService {

    static async getAllProducts (query) {
        const features = new ApiFeatures(Product.find(),query).filter().search().sort().fields().pagination()
        const products = await features.query
        const productsCount = await Product.countDocuments({isDeleted:false,...features.filterQuery,...features.searchQuery})
        return {products,productsCount,results:products.length}
    }

    static async getDeletedProducts () {
        const features = new ApiFeatures(Product.find({isDeleted:true}),query).filter().search().sort().fields().pagination()
        const products = await features.query
        const productsCount = await Product.countDocuments({isDeleted:true,...features.filterQuery,...features.searchQuery})
        return {products,productsCount,results:products.length}
    }

    static async getStatus () {
        const status = await Product.aggregate([
            {$match :{ isDeleted : false }},
            {$sort : { price : -1 }},
            {$group : {
                _id : "$category",
                productCount : {$sum : 1},
                minPrice : {$min: '$price'},
                maxPrice : {$max: '$price'},
                avgPrice : {$avg: '$price'},
                mostExpensiveProduct : {$first : '$$ROOT'}
            }}
        ])
        return status
    }

    static async getOneProduct (id) {
        const product = await Product.findById(id).populate("category")
        if(!product) throw new AppError(`No product found with this id ${id}`,404)
        return product
    }

    static async createProduct (body,files) {
        if (!files || !files.coverImage) throw new AppError('Product cover image is required', 400)
        const coverImage = {
            url : files.images[0].path ,
            public_id : files.images[0].filename
        }
        const images = files.images ? files.images.map(image => ({url:image.path,public_id:image.filename})) : []
        const product = await Product.create({...body,coverImage,images})
        return product
    }

    static async updateProduct (id,body,files) {
        const product = await Product.findById(id)
        if (!product) throw new AppError(`No product found with ID: ${id}`, 404);
        const updatedData = {...body}
        if(files && files.coverImage) {
            if (product.coverImage && product.coverImage.public_id) {
                await cloudinary
            }
        }
    }

}


module.exports = ProductService