const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');

// Configure multer to accept both images and qrCode fields
const upload = multer({ 
    storage,
    limits: {
        fileSize: 1024 * 1024 * 2, // 2MB limit
        files: 6 // 5 product images + 1 QR code
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }

        // Check file size before upload
        if (file.size > 1024 * 1024 * 2) {
            return cb(new Error('File size too large! Maximum size is 2MB'), false);
        }

        cb(null, true);
    }
});

// Error handling middleware
const uploadErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large! Maximum size is 2MB'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files! Maximum is 5 product images and 1 QR code'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next(err);
};

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const productController = require('../controllers/productController');

// Public routes
router.get('/categories', productController.getCategories);
router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/filters', productController.getFilters);
router.get('/search', productController.searchProducts);
router.get('/related/:id', productController.getRelatedProducts);
router.get('/:id', productController.getProductById);
router.get('/category/:category', productController.getProductsByCategory);

// Review routes (protected)
router.post('/:productId/reviews', auth, productController.addReview);
router.get('/:productId/reviews', productController.getProductReviews);
router.delete('/:productId/reviews', auth, productController.deleteProductReview);

// Protected routes (require authentication)
router.post('/:id/review', auth, productController.addProductReview);

// Admin only routes
router.post(
    '/add', 
    [auth, admin],
    upload.fields([
        { name: 'images', maxCount: 5 },
        { name: 'qrCode', maxCount: 1 }
    ]),
    uploadErrorHandler,
    productController.addProduct
);

router.put(
    '/:id', 
    [auth, admin],
    upload.fields([
        { name: 'images', maxCount: 5 },
        { name: 'qrCode', maxCount: 1 }
    ]),
    uploadErrorHandler,
    productController.updateProduct
);

router.delete('/:id', [auth, admin], productController.deleteProduct);
router.put('/:id/stock', [auth, admin], productController.updateStock);
router.put('/:id/featured', [auth, admin], productController.toggleFeatured);

module.exports = router;
