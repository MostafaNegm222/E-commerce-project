const mongoose = require("mongoose")
const bcrypt = require("bcryptjs");
const { customAlphabet } = require("nanoid");

const userSchema = new mongoose.Schema({
    name : {
        type : String ,
        required : true ,
        unique : true ,
        minLength : [3,`Name must be 3 characters or more`],
        maxLength : [30,`Name must be below 30 characters`]
    },
    email : {
        type : String ,
        required : true ,
        unique : true ,
        match : [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, `Email must be valid`]
    },
    password : {
        type : String ,
        required : true ,
        minLength : [6,`Password must be 6 characters or more`],
        select : false
    },
    image : {
        url : {
            type : String ,
            default : `https://www.pngfind.com/pngs/m/610-6104451_image-placeholder-png-user-profile-placeholder-image-png.png`
        } , 
        public_id : {
            type : String ,
            default : null
        }
    },
    phone : {
        type : String,
        match : [/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}$/,`Enter valid phone it must be like +201*********`]
    },
    isDeleted : {
        type : Boolean,
        default : false,
        select : false ,
    },
    isConfirmed : {
        type : Boolean ,
        default : false ,
    },
    confirmOTP : {
        type : String ,
        select : false
    },
    OTPExpired : {
        type : Date , 
        select : false
    },
    isActive : {
        type : Boolean ,
        default : false
    },
    lastSeen : {
        type : Date 
    },
    role : {
        type : String ,
        enum : ['user', 'admin'],
        default : 'user'
    },
    resetToken : {
        type : String
    },
    resetTokenExpired : {
        type : Date 
    }
},{
    timestamps : true ,
    versionKey : false,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.confirmOTP;
            delete ret.OTPExpired;
            delete ret.isDeleted;
            return ret; 
        }
    }
})

userSchema.pre(/^find/, async function () {
  this.find({ isDeleted: { $ne: true } });
});

userSchema.pre("save", async function () {
    if(!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password,+process.env.SALT_ROUND)
    const OTP  = customAlphabet('0123456789',6)()
    this.confirmOTP = await bcrypt.hash(OTP,+process.env.SALT_ROUND)
    this.OTPExpired = Date.now() + 10 * 60 * 1000
    this._plainOTP = OTP;
})

const User = mongoose.model("User",userSchema)

module.exports = User