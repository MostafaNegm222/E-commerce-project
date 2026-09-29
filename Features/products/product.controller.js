const catchAsync = require("../../utils/catchAsync");
const ProductService = require("./product.service");


exports.getAllProducts = catchAsync(async (req,res) => {
    const {products,productsCount,results} = await ProductService.getAllProducts(req.query)
    res.status(200).json({
        success: true ,
        results,
        productsCount,
        data : products
    })
})

exports.getDeletedProducts = catchAsync(async (req,res) => {
    const {products,productsCount,results} = await ProductService.getDeletedProducts(req.query)
    res.status(200).json({
        success: true ,
        results,
        productsCount,
        data : products
    })
})

exports.getStatus = catchAsync(async (req,res) => {
    const status = await ProductService.getStatus()
    res.status(200).json({
        success :true ,
        data : status
    })
})

exports.getOneProduct = catchAsync(async (req,res) => {
    const product = await ProductService.getOneProduct(req.params.id)
    res.status(200).json({
        success :true ,
        data : product
    })
})