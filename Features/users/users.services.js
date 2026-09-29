const { cloudinary } = require("../../config/cloudinary");
const AppError = require("../../utils/AppError");
const User = require("./users.model");

class UsersService {

    static updateImage (file) {
        if (!file) {
            throw new AppError(`Please upload an image file`, 400)
        }
        return {
            url : file.path ,
            public_id : file.filename 
        }
    }

    static async updateProfile(id, data, file) {
        const user = await User.findById(id);
        if (!user) throw new AppError(`User not found with id ${id}`, 404);
        const updateData = {};
        if (data.name) updateData.name = data.name;
        if (data.phone) updateData.phone = data.phone;
        if (file) {
            if (user.image && user.image.public_id) {
                await cloudinary.uploader.destroy(user.image.public_id);
            }
            updateData.image = this.updateImage(file);
        }
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { returnDocument: "after", runValidators: true }
        );
        return updatedUser;
    }
}

module.exports = UsersService