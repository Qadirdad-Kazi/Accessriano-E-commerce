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
    res.status(500).json({ message: 'Error adding product', error });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ message: 'Products retrieved successfully', data: products });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products', error });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ message: 'Product retrieved successfully', data: product });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving product', error });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (req.files) {
      if (req.files['productImage']) updates.productImageUrl = req.files['productImage'][0].path;
      if (req.files['qrImage']) updates.qrImageUrl = req.files['qrImage'][0].path;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    res.status(200).json({ message: 'Product updated successfully', data: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};
