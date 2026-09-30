const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("cloudinary").v2

cloudinary.config({
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET, 
    cloud_name: process.env.CLOUDINARY_CLOUD
})

const uploadTo = folder => {
    const storage  = new CloudinaryStorage({
        cloudinary : cloudinary ,
        params: async (req, file) => {
            const folderName = `e-commerce/${folder ? folder : 'general'}`;
            const cleanFileName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
            const uniquePublicId = `${cleanFileName}_${Date.now()}`;
            return {
            folder: folderName,
            public_id: `${uniquePublicId}`, 
            overwrite: true, 
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            transformation: [{ width: 800, height: 800, crop: 'limit' }]
            };
        }
    })
    return multer({
        storage ,
        limits : {fileSize: 5 * 1024 * 1024}
    })
}

module.exports = {uploadTo,cloudinary}
