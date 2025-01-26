const express = require("express");
const {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController"); // Ensure all controller functions are correctly imported
const Product = require("../models/Product"); // Import the Product model
const router = express.Router();

// Define routes
router.get("/", getProducts); // Fetch all products
router.post("/", addProduct); // Add a new product
router.put("/:id", updateProduct); // Update an existing product
router.delete("/:id", deleteProduct); // Delete a product

// Search route
router.get("/search", async (req, res) => {
  const { query } = req.query;
  try {
    const products = await Product.find({ name: { $regex: query, $options: "i" } });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error searching products" });
  }
});

module.exports = router;
