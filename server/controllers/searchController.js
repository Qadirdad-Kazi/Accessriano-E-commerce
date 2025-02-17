const searchService = require('../services/searchService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.searchProducts = catchAsync(async (req, res) => {
    const {
        query,
        category,
        brand,
        minPrice,
        maxPrice,
        minRating,
        tags,
        sortBy,
        page,
        limit,
        inStock
    } = req.query;

    const result = await searchService.search({
        query,
        category,
        brand,
        minPrice,
        maxPrice,
        minRating,
        tags: tags ? tags.split(',') : [],
        sortBy,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 12,
        inStock: inStock === 'true'
    });

    res.status(200).json({
        success: true,
        data: result
    });
});

exports.getAutocompleteSuggestions = catchAsync(async (req, res) => {
    const { query } = req.query;

    if (!query) {
        throw new AppError('Search query is required', 400);
    }

    const suggestions = await searchService.getAutocompleteSuggestions(query);

    res.status(200).json({
        success: true,
        data: suggestions
    });
});

exports.getPopularSearches = catchAsync(async (req, res) => {
    const popularSearches = await searchService.getPopularSearches();

    res.status(200).json({
        success: true,
        data: popularSearches
    });
});

exports.getRelatedProducts = catchAsync(async (req, res) => {
    const { productId } = req.params;
    const { limit } = req.query;

    if (!productId) {
        throw new AppError('Product ID is required', 400);
    }

    const relatedProducts = await searchService.getRelatedProducts(
        productId,
        parseInt(limit) || 8
    );

    res.status(200).json({
        success: true,
        data: relatedProducts
    });
});
