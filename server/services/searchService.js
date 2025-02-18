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

        // Initialize popular search terms
        this.popularSearchTerms = [
            'rings',
            'bracelets',
            'necklaces',
            'watches',
            'earrings',
            'sunglasses',
            'caps',
            'shoes',
            'bags',
            'wallets'
        ];
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

            // Execute search query with proper error handling
            const [products, total] = await Promise.all([
                Product.find(searchCriteria)
                    .sort(sortConfig)
                    .skip(skip)
                    .limit(limit)
                    .select('-__v')
                    .lean()
                    .exec(),
                Product.countDocuments(searchCriteria)
            ]).catch(error => {
                console.error('Search query error:', error);
                throw new Error('Failed to execute search query');
            });

            // Get aggregated data for filters
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
            ]).catch(error => {
                console.error('Aggregate query error:', error);
                throw new Error('Failed to get filter data');
            });

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
            console.error('Search service error:', error);
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
                { $limit: 10 }
            ]).catch(error => {
                console.error('Autocomplete query error:', error);
                throw new Error('Failed to get autocomplete suggestions');
            });

            return suggestions;
        } catch (error) {
            console.error('Autocomplete service error:', error);
            throw error;
        }
    }

    async getPopularSearches() {
        try {
            // In a real application, this would be fetched from analytics or search logs
            // For now, we'll return predefined popular terms
            return this.popularSearchTerms;
        } catch (error) {
            console.error('Error getting popular searches:', error);
            throw error;
        }
    }

    async getRelatedProducts(productId, limit = 8) {
        try {
            const product = await Product.findById(productId).lean().exec();
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
                .select('-__v')
                .lean()
                .exec();

            return relatedProducts;
        } catch (error) {
            console.error('Related products error:', error);
            throw error;
        }
    }

    async searchProducts({
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
                searchCriteria.$or = [
                    { name: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { category: { $regex: query, $options: 'i' } },
                    { tags: { $regex: query, $options: 'i' } }
                ];
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
                if (minPrice !== undefined) searchCriteria.price.$gte = minPrice;
                if (maxPrice !== undefined) searchCriteria.price.$lte = maxPrice;
            }

            // Rating filter
            if (minRating) {
                searchCriteria.averageRating = { $gte: minRating };
            }

            // Tags filter
            if (tags.length > 0) {
                searchCriteria.tags = { $in: tags };
            }

            // Stock filter
            if (inStock) {
                searchCriteria.stockQuantity = { $gt: 0 };
            }

            // Calculate skip value for pagination
            const skip = (page - 1) * limit;

            // Get sort options
            const sort = this.sortOptions[sortBy] || this.sortOptions.newest;

            // Execute query
            const [products, total] = await Promise.all([
                Product.find(searchCriteria)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Product.countDocuments(searchCriteria)
            ]);

            // Calculate total pages
            const totalPages = Math.ceil(total / limit);

            return {
                products,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: total,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            };
        } catch (error) {
            console.error('Product search error:', error);
            throw error;
        }
    }

    async search(query) {
        try {
            if (!query) return [];

            const searchCriteria = {
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { category: { $regex: query, $options: 'i' } },
                    { tags: { $regex: query, $options: 'i' } }
                ]
            };

            const products = await Product.find(searchCriteria)
                .select('name category price images')
                .limit(10)
                .lean();

            return products.map(product => ({
                _id: product._id,
                name: product.name,
                category: product.category,
                price: product.price,
                image: product.images[0]
            }));
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    }
}

module.exports = new SearchService();