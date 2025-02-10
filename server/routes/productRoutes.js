const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const productController = require('../controllers/productController');

// Create: Add a new product with QR image upload
router.post('/add', upload.single('qrImage'), productController.addProduct);

// Read: Get all products
router.get('/', productController.getAllProducts);

// Read: Get a product by ID
router.get('/:id', productController.getProductById);

// Update: Update a product by ID (optionally with a new QR image)
router.put('/:id', upload.single('qrImage'), productController.updateProduct);

// Delete: Delete a product by ID
router.delete('/:id', productController.deleteProduct);

module.exports = router;
