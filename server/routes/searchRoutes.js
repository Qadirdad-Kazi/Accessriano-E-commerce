const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { cache } = require('../middleware/cache');

// Search products with filters
router.get('/products', cache(300), searchController.searchProducts);

// Get autocomplete suggestions
router.get('/autocomplete', searchController.getAutocompleteSuggestions);

// Get popular searches
router.get('/popular', cache(3600), searchController.getPopularSearches);

// Get related products
router.get('/related/:productId', cache(300), searchController.getRelatedProducts);

module.exports = router;
