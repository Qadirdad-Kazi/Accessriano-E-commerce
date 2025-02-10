const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true }
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: 'pending', // e.g., pending, processing, completed, cancelled
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Order', OrderSchema);
