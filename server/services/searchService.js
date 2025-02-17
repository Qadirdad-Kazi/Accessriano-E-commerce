const Product = require('../models/Product');

class SearchService {
    constructor() {
        this.sortOptions = {
            'price-asc': { price: 1 },
            'price-desc': { price: -1 },
            'rating-desc': { averageRating: -1 },
            'newest': { createdAt: -1 },
            'popularity': { numberOfReviews: -1 }
        };
    }

    async search({
        query = '',
        category = '',
        brand = '',
        minPrice,
        maxPrice,
        minRating,
        tags = [],
        sortBy = 'newest',
        page = 1,
        limit = 12,
        inStock = false
    }) {
        try {
            // Build search criteria
            const searchCriteria = {};

            // Text search if query provided
            if (query) {
                searchCriteria.$text = { $search: query };
            }

            // Category filter
            if (category) {
                searchCriteria.category = category;
            }

            // Brand filter
            if (brand) {
                searchCriteria.brand = brand;
            }

            // Price range filter
            if (minPrice !== undefined || maxPrice !== undefined) {
                searchCriteria.price = {};
                if (minPrice !== undefined) {
                    searchCriteria.price.$gte = Number(minPrice);
                }
                if (maxPrice !== undefined) {
                    searchCriteria.price.$lte = Number(maxPrice);
                }
            }

            // Rating filter
            if (minRating) {
                searchCriteria.averageRating = { $gte: Number(minRating) };
            }

            // Tags filter
            if (tags.length > 0) {
                searchCriteria.tags = { $in: tags };
            }

            // Stock filter
            if (inStock) {
                searchCriteria.stock = { $gt: 0 };
            }

            // Calculate skip value for pagination
            const skip = (page - 1) * limit;

            // Get sort configuration
            const sortConfig = this.sortOptions[sortBy] || this.sortOptions['newest'];

            // Execute search query
            const [products, total] = await Promise.all([
                Product.find(searchCriteria)
                    .sort(sortConfig)
                    .skip(skip)
                    .limit(limit)
                    .select('-__v'),
                Product.countDocuments(searchCriteria)
            ]);

            // Get unique brands and price range for filters
            const aggregateData = await Product.aggregate([
                { $match: searchCriteria },
                {
                    $facet: {
                        brands: [
                            { $group: { _id: '$brand' } },
                            { $sort: { _id: 1 } }
                        ],
                        priceRange: [
                            {
                                $group: {
                                    _id: null,
                                    min: { $min: '$price' },
                                    max: { $max: '$price' }
                                }
                            }
                        ],
                        categories: [
                            { $group: { _id: '$category' } },
                            { $sort: { _id: 1 } }
                        ],
                        tags: [
                            { $unwind: '$tags' },
                            { $group: { _id: '$tags' } },
                            { $sort: { _id: 1 } }
                        ]
                    }
                }
            ]);

            return {
                products,
                pagination: {
                    current: page,
                    total,
                    pages: Math.ceil(total / limit),
                    perPage: limit
                },
                filters: {
                    brands: aggregateData[0].brands.map(b => b._id),
                    categories: aggregateData[0].categories.map(c => c._id),
                    tags: aggregateData[0].tags.map(t => t._id),
                    priceRange: aggregateData[0].priceRange[0] || { min: 0, max: 0 }
                }
            };
        } catch (error) {
            console.error('Search error:', error);
            throw error;
        }
    }

    async getAutocompleteSuggestions(query) {
        try {
            if (!query || query.length < 2) return [];

            const suggestions = await Product.aggregate([
                {
                    $search: {
                        autocomplete: {
                            query,
                            path: 'name',
                            fuzzy: {
                                maxEdits: 1,
                                prefixLength: 1
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        category: 1,
                        score: { $meta: 'searchScore' }
                    }
                },
                {
                    $limit: 10
                }
            ]);

            return suggestions;
        } catch (error) {
            console.error('Autocomplete error:', error);
            throw error;
        }
    }

    async getPopularSearches() {
        // TODO: Implement popular searches tracking and retrieval
        return [];
    }

    async getRelatedProducts(productId, limit = 8) {
        try {
            const product = await Product.findById(productId);
            if (!product) return [];

            const relatedProducts = await Product.find({
                $and: [
                    { _id: { $ne: productId } },
                    {
                        $or: [
                            { category: product.category },
                            { brand: product.brand },
                            { tags: { $in: product.tags } }
                        ]
                    }
                ]
            })
                .sort({ averageRating: -1 })
                .limit(limit)
                .select('-__v');

            return relatedProducts;
        } catch (error) {
            console.error('Related products error:', error);
            throw error;
        }
    }
}

module.exports = new SearchService();
