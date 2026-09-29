const mongoose = require("mongoose")
const slugify = require("slugify")
const productSchema = new mongoose.Schema({
    title : {
        type : String ,
        required : [true , "Product title is required"] ,
        unique : true ,
        trim : true ,
        minLength : [3,'Product title must be 3 characters or more'],
        maxLength : [100,'Product title must be below 100 characters'],
    },
    slug : {
        type : String ,
        lowercase : true ,
        index : true
    },
    description : {
        required : [true , "Product description is required"] ,
        trim : true ,
        minLength : [20,'Product description must be 20 characters or more'],
    },
    price : {
        type : Number ,
        required : [true , "Product price is required"] ,
        min: [0,"Product price must be positive value"]
    },
    priceAfterDiscount : {
        type : Number ,
        validate : {
            validator : function (val) {
                return val < this.price
            },
            message : `Discount price ({VALUE}) should be lower than regular price`
        }
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    coverImage: {
      url: {
        type: String,
        required: [true, 'Product cover image is required'],
      },
      public_id: {
        type: String,
        required: [true, 'Cover image public_id is required'],
      },
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category'],
    },
    colors: [String],
    sizes: [String],
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above or equal to 1.0'],
      max: [5, 'Rating must be below or equal to 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false, 
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
}, {
    timestamps : true ,
    versionKey : false ,
    toJSON : {virtual :true} ,
    toObject : {virtual :true} ,
})

productSchema.index({price:1,ratingsAverage:-1})
productSchema.index({title:"text",description:"text"})

productSchema.pre("save" , function (next) {
    if (this.isModified("title")) {
        this.slug = slugify(this.title,{lower:true})
    }
    next()
})

productSchema.pre(/^find/,function (next) {
    const filter = this.getFilter()
    if (filter.isDeleted === undefined) {
        this.find({isDeleted : {$ne : true}})
    }
    next()
})

const Product = mongoose.model('Product',productSchema)

module.exports = Product