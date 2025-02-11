const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const productController = require('../controllers/productController');

// Create a new product (accept both qrImage and productImage)
router.post(
  '/add',
  upload.fields([
    { name: 'qrImage', maxCount: 1 },
    { name: 'productImage', maxCount: 1 }
  ]),
  productController.addProduct
);

// Update product with potential new images
router.put(
  '/:id',
  upload.fields([
    { name: 'qrImage', maxCount: 1 },
    { name: 'productImage', maxCount: 1 }
  ]),
  productController.updateProduct
);

// Other product routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
