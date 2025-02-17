const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');
const Order = require('../models/Order'); // Assuming Order model is defined in this file

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    const productData = req.body;
    
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
    const requiredFields = ['name', 'description', 'price', 'category', 'seller', 'stock'];
    for (const field of requiredFields) {
      if (!productData[field]) {
        return res.status(400).json({ 
          success: false,
          message: `${field} is required` 
        });
      }
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
    console.error('Error in addProduct:', error);
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

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.status(200).json({ 
      success: true,
      message: 'Products retrieved successfully', 
      data: products 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error retrieving products', 
      error: error.message 
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

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.params;
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    });
    res.status(200).json({ 
      success: true,
      message: 'Search results retrieved successfully', 
      data: products 
    });
  } catch (error) {
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

module.exports = {
  addProduct: exports.addProduct,
  getAllProducts: exports.getAllProducts,
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
  getProductReviews: exports.getProductReviews
};
