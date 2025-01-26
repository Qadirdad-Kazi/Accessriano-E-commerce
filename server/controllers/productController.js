const Product = require("../models/Product");
const QRCode = require("qrcode");

// Fetch all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
};

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    const { name, price, description, image } = req.body;

    // Generate QR code URL
    const qrCodeData = `https://your-frontend-url/product/${name}`;
    const qrCode = await QRCode.toDataURL(qrCodeData);

    const newProduct = new Product({ name, price, description, image, qrCode });
    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: "Error adding product" });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product" });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" });
  }
};
