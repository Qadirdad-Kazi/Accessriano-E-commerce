const express = require("express");
const { getProducts, addProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const router = express.Router();

router.get("/", getProducts);
router.post("/", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

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
  