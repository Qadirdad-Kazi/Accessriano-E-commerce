const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const productController = require('../controllers/productController');

router.post('/add', upload.fields([{ name: 'productImage', maxCount: 1 }, { name: 'qrImage', maxCount: 1 }]), productController.addProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', upload.fields([{ name: 'productImage', maxCount: 1 }, { name: 'qrImage', maxCount: 1 }]), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
