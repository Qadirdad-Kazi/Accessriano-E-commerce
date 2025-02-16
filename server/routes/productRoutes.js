const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const productController = require('../controllers/productController');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/featured', productController.getFeaturedProducts);
router.get('/:id', productController.getProductById);
router.get('/search/:query', productController.searchProducts);

// Protected routes (require authentication)
router.post('/:id/review', auth, productController.addProductReview);
router.delete('/:id/review', auth, productController.deleteProductReview);

// Admin only routes
router.post('/add', [auth, admin], upload.fields([
  { name: 'productImage', maxCount: 1 }, 
  { name: 'qrImage', maxCount: 1 }
]), productController.addProduct);

router.put('/:id', [auth, admin], upload.fields([
  { name: 'productImage', maxCount: 1 }, 
  { name: 'qrImage', maxCount: 1 }
]), productController.updateProduct);

router.delete('/:id', [auth, admin], productController.deleteProduct);
router.put('/:id/stock', [auth, admin], productController.updateStock);
router.put('/:id/featured', [auth, admin], productController.toggleFeatured);

module.exports = router;
