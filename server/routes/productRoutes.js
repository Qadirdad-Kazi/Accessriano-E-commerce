// server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const productController = require('../controllers/productController');

// Route for adding a new product with a QR image upload
router.post('/add', upload.single('qrImage'), productController.addProduct);

module.exports = router;
