const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const productController = require('../controllers/productController');
const auth = require('../middleware/auth'); // Import the auth middleware

// Create: Add a new product with QR image upload (optional protection, based on your design)
// If product creation should be limited to authenticated users, add auth middleware.
router.post('/add', auth, upload.single('qrImage'), productController.addProduct);

// Read: Get all products (usually public)
router.get('/', productController.getAllProducts);

// Read: Get a product by ID (usually public)
router.get('/:id', productController.getProductById);

// Update: Update a product by ID (protected route)
router.put('/:id', auth, upload.single('qrImage'), productController.updateProduct);

// Delete: Delete a product by ID (protected route)
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;
