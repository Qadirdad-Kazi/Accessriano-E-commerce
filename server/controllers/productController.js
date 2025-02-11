const Product = require('../models/Product');

exports.addProduct = async (req, res) => {
  try {
    // Get product details from the request body
    const productData = req.body;
    console.log("Received body:", productData);

    // If files were uploaded, add their Cloudinary URLs to the product data
    if (req.files && req.files.qrImage && req.files.qrImage.length > 0) {
      productData.qrImageUrl = req.files.qrImage[0].path; // Cloudinary returns URL in 'path'
    }
    if (req.files && req.files.productImage && req.files.productImage.length > 0) {
      productData.productImageUrl = req.files.productImage[0].path;
    }
    
    console.log("Product data after processing files:", productData);
    
    const product = new Product(productData);
    await product.save();
    
    res.status(201).json({
      message: 'Product added successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updates = req.body;
    if (req.files && req.files.qrImage && req.files.qrImage.length > 0) {
      updates.qrImageUrl = req.files.qrImage[0].path;
    }
    if (req.files && req.files.productImage && req.files.productImage.length > 0) {
      updates.productImageUrl = req.files.productImage[0].path;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    res.status(200).json({
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ message: 'Products retrieved successfully', data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product retrieved successfully', data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};
