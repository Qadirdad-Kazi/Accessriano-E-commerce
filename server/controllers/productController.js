const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');
const Order = require('../models/Order'); // Assuming Order model is defined in this file

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    
    // Parse JSON strings back to objects/arrays
    if (productData.specifications) {
      try {
        productData.specifications = JSON.parse(productData.specifications);
      } catch (e) {
        productData.specifications = [];
      }
    }

    if (productData.variants) {
      try {
        productData.variants = JSON.parse(productData.variants);
      } catch (e) {
        productData.variants = [];
      }
    }

    if (productData.dimensions) {
      try {
        productData.dimensions = JSON.parse(productData.dimensions);
      } catch (e) {
        delete productData.dimensions;
      }
    }

    if (productData.weight) {
      try {
        productData.weight = JSON.parse(productData.weight);
      } catch (e) {
        delete productData.weight;
      }
    }

    // Handle product images
    if (req.files && req.files['images']) {
      productData.images = req.files['images'].map(file => file.path);
    } else {
      return res.status(400).json({
        success: false,
        message: 'At least one product image is required'
      });
    }

    // Handle QR code image
    if (req.files && req.files['qrCode']) {
      productData.qrCode = req.files['qrCode'][0].path;
    }

    // Validate required fields
    const requiredFields = ['name', 'sku', 'description', 'price', 'category', 'seller', 'stock', 'brand'];
    for (const field of requiredFields) {
      if (!productData[field]) {
        return res.status(400).json({ 
          success: false,
          message: `${field} is required` 
        });
      }
    }

    // Convert numeric strings to numbers
    ['price', 'stock', 'discountPrice', 'discountPercentage'].forEach(field => {
      if (productData[field]) {
        productData[field] = Number(productData[field]);
      }
    });

    // Set onSale flag if discount is present
    if (productData.discountPrice || productData.discountPercentage) {
      productData.onSale = true;
    }

    // Create and save the product
    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: product,
    });
  } catch (error) {
    console.warn('Error in addProduct:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding product', 
      error: error.message 
    });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
};

// Get all categories with metadata
exports.getCategories = async (req, res) => {
  try {
    // Get distinct categories from products
    const categories = await Product.distinct('category');
    
    // Get category counts and additional metadata
    const categoryDetails = await Promise.all(
      categories.map(async (category) => {
        const count = await Product.countDocuments({ category });
        const sample = await Product.findOne({ category }).select('categoryMetadata');
        
        return {
          name: category,
          count,
          displayName: sample?.categoryMetadata?.displayName || category,
          description: sample?.categoryMetadata?.description || `Browse our collection of ${category} products`,
          icon: sample?.categoryMetadata?.icon || null,
          featured: sample?.categoryMetadata?.featured || false
        };
      })
    );

    // Sort categories: featured first, then by count
    const sortedCategories = categoryDetails.sort((a, b) => {
      if (a.featured !== b.featured) return b.featured - a.featured;
      return b.count - a.count;
    });

    res.status(200).json({
      success: true,
      categories: sortedCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

// Get products by category with pagination and filters
exports.getProductsByCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const sort = req.query.sort || '-createdAt';
    const category = req.params.category;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const inStock = req.query.inStock === 'true';
    const onSale = req.query.onSale === 'true';

    const query = { category };

    // Add filters
    if (minPrice) query.price = { $gte: parseFloat(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };
    if (inStock) query.stock = { $gt: 0 };
    if (onSale) query.onSale = true;

    const products = await Product.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('name price images discountPrice onSale stock rating numReviews');

    const total = await Product.countDocuments(query);

    // Get category metadata
    const categoryMetadata = await Product.findOne({ category })
      .select('categoryMetadata')
      .lean();

    res.status(200).json({
      success: true,
      products,
      metadata: categoryMetadata?.categoryMetadata || {
        displayName: category,
        description: `Browse our collection of ${category} products`
      },
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasMore: page * limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true });
    res.status(200).json({ 
      success: true,
      message: 'Featured products retrieved successfully', 
      data: products 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error retrieving featured products', 
      error: error.message 
    });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ 
      success: false,
      message: 'Product not found' 
    });

    res.status(200).json({ 
      success: true,
      message: 'Product retrieved successfully', 
      data: product 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error retrieving product', 
      error: error.message 
    });
  }
};

// Get available filters
exports.getFilters = async (req, res) => {
  try {
    // Get unique categories
    const categories = await Product.distinct('category');

    // Get unique brands
    const brands = await Product.distinct('seller');

    // Get price range
    const priceRange = await Product.aggregate([
      {
        $group: {
          _id: null,
          min: { $min: '$price' },
          max: { $max: '$price' }
        }
      }
    ]);

    // Get unique tags
    const tags = await Product.distinct('tags');

    res.status(200).json({
      success: true,
      data: {
        categories,
        brands,
        priceRange: priceRange[0] || { min: 0, max: 0 },
        tags
      }
    });
  } catch (error) {
    console.error('Error getting filters:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting filters',
      error: error.message
    });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const {
      q = '',
      page = 1,
      limit = 12,
      sortBy = 'newest',
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      tags,
      inStock
    } = req.query;

    // Build search query
    const searchQuery = {
      $and: [
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    };

    // Add filters
    if (category) {
      searchQuery.$and.push({ category });
    }
    if (brand) {
      searchQuery.$and.push({ seller: brand });
    }
    if (minPrice || maxPrice) {
      const priceQuery = {};
      if (minPrice) priceQuery.$gte = Number(minPrice);
      if (maxPrice) priceQuery.$lte = Number(maxPrice);
      searchQuery.$and.push({ price: priceQuery });
    }
    if (minRating) {
      searchQuery.$and.push({ 'rating.average': { $gte: Number(minRating) } });
    }
    if (tags) {
      searchQuery.$and.push({ tags: { $in: tags.split(',') } });
    }
    if (inStock === 'true') {
      searchQuery.$and.push({ stock: { $gt: 0 } });
    }

    // Build sort query
    let sortQuery = {};
    switch (sortBy) {
      case 'price-asc':
        sortQuery = { price: 1 };
        break;
      case 'price-desc':
        sortQuery = { price: -1 };
        break;
      case 'rating-desc':
        sortQuery = { 'rating.average': -1 };
        break;
      case 'popularity':
        sortQuery = { soldCount: -1 };
        break;
      default: // newest
        sortQuery = { createdAt: -1 };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find(searchQuery)
        .sort(sortQuery)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(searchQuery)
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    console.log('Search results:', {
      query: q,
      filters: searchQuery,
      sort: sortQuery,
      productsFound: products.length,
      total,
      page,
      totalPages
    });

    res.status(200).json({
      success: true,
      products,
      total,
      currentPage: Number(page),
      totalPages,
      hasMore: page < totalPages
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    if (req.files) {
      if (req.files['productImage']) {
        productData.productImageUrl = req.files['productImage'][0].path;
      }
      if (req.files['qrImage']) {
        productData.qrImageUrl = req.files['qrImage'][0].path;
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true }
    );

    if (!product) return res.status(404).json({ 
      success: false,
      message: 'Product not found' 
    });

    res.status(200).json({ 
      success: true,
      message: 'Product updated successfully', 
      data: product 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating product', 
      error: error.message 
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ 
      success: false,
      message: 'Product not found' 
    });

    res.status(200).json({ 
      success: true,
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting product', 
      error: error.message 
    });
  }
};

// Update stock
exports.updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true }
    );
    
    if (!product) return res.status(404).json({ 
      success: false,
      message: 'Product not found' 
    });

    res.status(200).json({ 
      success: true,
      message: 'Stock updated successfully', 
      data: product 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating stock', 
      error: error.message 
    });
  }
};

// Toggle featured status
exports.toggleFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ 
      success: false,
      message: 'Product not found' 
    });

    product.featured = !product.featured;
    await product.save();

    res.status(200).json({ 
      success: true,
      message: 'Featured status updated successfully', 
      data: product 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating featured status', 
      error: error.message 
    });
  }
};

// Add product review
exports.addProductReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) return res.status(404).json({ 
      success: false,
      message: 'Product not found' 
    });

    product.ratings.push({
      user: req.user.id,
      rating,
      review
    });

    await product.save();
    res.status(200).json({ 
      success: true,
      message: 'Review added successfully', 
      data: product 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error adding review', 
      error: error.message 
    });
  }
};

// Delete product review
exports.deleteProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ 
      success: false,
      message: 'Product not found' 
    });

    product.ratings = product.ratings.filter(
      rating => rating.user.toString() !== req.user.id
    );

    await product.save();
    res.status(200).json({ 
      success: true,
      message: 'Review deleted successfully', 
      data: product 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting review', 
      error: error.message 
    });
  }
};

// Add review to a product
exports.addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, review, orderId } = req.body;
    const userId = req.user._id;

    if (!rating || !review || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Rating, review text, and order ID are required'
      });
    }

    // Verify if user has purchased and received the product
    const order = await Order.findOne({
      _id: orderId,
      user: userId
    }).populate('products.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check order status and payment status
    if (order.status !== 'delivered') {
      return res.status(403).json({
        success: false,
        message: 'You can only review products from delivered orders'
      });
    }

    if (order.paymentStatus !== 'completed') {
      return res.status(403).json({
        success: false,
        message: 'You can only review products from orders with completed payment'
      });
    }

    // Find the specific product in the order
    const orderProduct = order.products.find(
      p => p.product._id.toString() === productId.toString()
    );

    if (!orderProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in the specified order'
      });
    }

    if (orderProduct.reviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product from this order'
      });
    }

    // Get the product and check for existing reviews
    const product = await Product.findById(productId).populate('ratings.user');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user has already reviewed this product from any order
    const existingReview = product.ratings.find(
      r => r.user._id.toString() === userId.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Add the review
    product.ratings.push({
      user: userId,
      order: orderId,
      rating,
      review,
      createdAt: new Date()
    });

    // Update average rating
    const totalRating = product.ratings.reduce((sum, r) => sum + r.rating, 0);
    product.averageRating = totalRating / product.ratings.length;
    product.numberOfReviews = product.ratings.length;

    // Mark the product as reviewed in the order
    orderProduct.reviewed = true;

    // Save both documents
    await Promise.all([
      order.save(),
      product.save()
    ]);

    // Return the updated product with populated user data
    const updatedProduct = await Product.findById(productId)
      .populate('ratings.user', 'name email')
      .populate('ratings.order');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding review',
      error: error.message
    });
  }
};

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId)
      .populate({
        path: 'ratings.user',
        select: 'name avatar'
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product.ratings
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// Get related products
exports.getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 8, category } = req.query;

    // Find the current product to get its category
    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find related products in the same category, excluding the current product
    const query = {
      _id: { $ne: id },
      category: category || currentProduct.category,
      status: 'active'
    };

    const relatedProducts = await Product.find(query)
      .limit(parseInt(limit))
      .select('name price description images stock category brand discountPrice onSale rating')
      .sort('-rating');

    res.status(200).json({
      success: true,
      data: relatedProducts
    });
  } catch (error) {
    console.error('Error in getRelatedProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching related products',
      error: error.message
    });
  }
};

module.exports = {
  addProduct: exports.addProduct,
  getAllProducts: exports.getAllProducts,
  getCategories: exports.getCategories,
  getProductsByCategory: exports.getProductsByCategory,
  getFeaturedProducts: exports.getFeaturedProducts,
  getProductById: exports.getProductById,
  searchProducts: exports.searchProducts,
  updateProduct: exports.updateProduct,
  deleteProduct: exports.deleteProduct,
  updateStock: exports.updateStock,
  toggleFeatured: exports.toggleFeatured,
  addProductReview: exports.addProductReview,
  deleteProductReview: exports.deleteProductReview,
  addReview: exports.addReview,
  getProductReviews: exports.getProductReviews,
  getFilters: exports.getFilters,
  getRelatedProducts: exports.getRelatedProducts
};
