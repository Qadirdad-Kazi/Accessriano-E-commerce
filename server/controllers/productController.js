const Product = require('../models/Product');

// Add a new product (with file upload handled earlier)
exports.addProduct = async (req, res) => {
  try {
    const productData = req.body;
    if (req.file) {
      productData.qrImageUrl = req.file.path;
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

// Retrieve all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({
      message: 'Products retrieved successfully',
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving products', error });
  }
};

// Retrieve a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({
      message: 'Product retrieved successfully',
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving product', error });
  }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
  try {
    const updates = req.body;
    // If a new file is uploaded, update the qrImageUrl
    if (req.file) {
      updates.qrImageUrl = req.file.path;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating product', error });
  }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting product', error });
  }
};
