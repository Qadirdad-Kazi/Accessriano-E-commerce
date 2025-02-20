const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

// ✅ Public Routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategory);
router.get('/:id/products', categoryController.getCategoryWithProducts); // Fetch category with products

// ✅ Admin Routes (Protected)
router.use(auth);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
