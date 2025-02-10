const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');       // JWT authentication middleware
const adminAuth = require('../middleware/adminAuth'); // Role-based admin middleware

// Only authenticated admin users can add, update, or delete products
router.post('/add', auth, adminAuth, upload.single('qrImage'), productController.addProduct);
router.put('/:id', auth, adminAuth, upload.single('qrImage'), productController.updateProduct);
router.delete('/:id', auth, adminAuth, productController.deleteProduct);

// Public endpoints (for reading products) can remain unprotected
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

module.exports = router;
