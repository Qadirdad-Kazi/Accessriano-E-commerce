// server/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // e.g., 'your-cloud-name'
  api_key: process.env.CLOUDINARY_API_KEY,       // e.g., '395575354577165'
  api_secret: process.env.CLOUDINARY_API_SECRET  // e.g., 'SdiMZx2rxmbcmklasDMcHwFDyEc'
});

// Set up Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'AccessrianoQR',         // Folder name in Cloudinary where QR images will be stored
    allowedFormats: ['jpg', 'png', 'jpeg'], // Allowed image formats
  },
});

module.exports = {
  cloudinary,
  storage,
};
