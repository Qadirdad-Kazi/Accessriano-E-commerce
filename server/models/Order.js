const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true },
    },
  ],
  status: { type: String, enum: ["Pending", "Shipped", "Delivered"], default: "Pending" },
});

module.exports = mongoose.model("Order", orderSchema);
