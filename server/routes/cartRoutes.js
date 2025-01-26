const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");

router.post("/", async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $push: { items: { productId, quantity } } },
      { upsert: true, new: true }
    );
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error updating cart" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart" });
  }
});

module.exports = router;
