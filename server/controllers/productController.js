const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

// Add a new product
exports.addProduct = async (req, res) => {
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

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      message: 'Product added successfully',
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ message: 'Products retrieved successfully', data: products });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products', error: error.message });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.status(200).json({ message: 'Products retrieved successfully', data: products });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products', error: error.message });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true });
    res.status(200).json({ message: 'Featured products retrieved successfully', data: products });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving featured products', error: error.message });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ message: 'Product retrieved successfully', data: product });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving product', error: error.message });
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
    res.status(200).json({ message: 'Search results retrieved successfully', data: products });
  } catch (error) {
    res.status(500).json({ message: 'Error searching products', error: error.message });
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

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ message: 'Product updated successfully', data: product });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
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
    
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ message: 'Stock updated successfully', data: product });
  } catch (error) {
    res.status(500).json({ message: 'Error updating stock', error: error.message });
  }
};

// Toggle featured status
exports.toggleFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.featured = !product.featured;
    await product.save();

    res.status(200).json({ message: 'Featured status updated successfully', data: product });
  } catch (error) {
    res.status(500).json({ message: 'Error updating featured status', error: error.message });
  }
};

// Add product review
exports.addProductReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.ratings.push({
      user: req.user.id,
      rating,
      review
    });

    await product.save();
    res.status(200).json({ message: 'Review added successfully', data: product });
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
};

// Delete product review
exports.deleteProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.ratings = product.ratings.filter(
      rating => rating.user.toString() !== req.user.id
    );

    await product.save();
    res.status(200).json({ message: 'Review deleted successfully', data: product });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};
