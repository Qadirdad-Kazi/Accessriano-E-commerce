const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  text: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  approved: { type: Boolean, default: false },
});

module.exports = mongoose.model("Review", reviewSchema);
