const ApiFeatures = require("../../utils/ApiFeatures");
const AppError = require("../../utils/AppError");
const User = require("./users.model");

class UsersService {

    static async getAllUsers (query) {
        const features = new ApiFeatures(User.find(),query).filter().search().sort().fields().pagination()
        const users = await features.query
        const usersCount = await User.countDocuments({isDeleted:false,...features.filterQuery,...features.searchQuery})
        return {
            users,
            usersCount
        }
    }

    static async getDeletedUsers (query) {
        const features = new ApiFeatures(User.find({isDeleted:true}),query).filter().search().sort().fields().pagination()
        const users = await features.query
        const usersCount = await User.countDocuments({isDeleted:true,...features.filterQuery,...features.searchQuery})
        return {
            users,
            usersCount
        }
    }

    static async getOneUser(id) {
        const user = await User.findById(id)
        if(!user) throw new AppError(`This user is not found with this id ${id}`,404)
        return user
    }

    static async createUser (body) {
        const {email,name,password,image,phone} = body 
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('This email is already registered', 400);
        }
        const user = await User.create({email,name,password,image,phone,isConfirmed:true})
        return user
    }

    static async updateUserRole (id,role) {
        if (!['user', 'admin'].includes(role)) {
            throw new AppError('Invalid role provided', 400);
        }
        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { returnDocument: "after", runValidators: true }
        );
        if(!user) throw new AppError(`This user is not found with this id ${id}`,404)
        return user
    }

    static async softDeleteUser (id) {
        const user = await User.findByIdAndUpdate(id,{isDeleted:true},{returnDocument:"after"}).select("+isDeleted")
        if(!user) throw new AppError(`This user is not found with this id ${id}`,404)
        return user
    }

    static async restoreUser (id) {
        const user = await User.findOneAndUpdate({_id:id,isDeleted:true},{isDeleted:false},{returnDocument:"after"}).select("+isDeleted")
        if(!user) throw new AppError(`This user is not found with this id ${id}`,404)
        return user
    }

    static async deleteUser (id) {
        const user = await User.findByIdAndDelete(id)
        if(!user) throw new AppError(`This user is not found with this id ${id}`,404)
        return user
    }
}

module.exports = UsersService