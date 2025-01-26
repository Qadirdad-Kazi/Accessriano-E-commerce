const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  qrCode: { type: String }, // Add QR code URL field
});

module.exports = mongoose.model("Product", productSchema);
