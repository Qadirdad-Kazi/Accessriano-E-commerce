const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        default: 1,
        min: [1, 'Quantity must be at least 1']
      },
      price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
      },
      reviewed: {
        type: Boolean,
        default: false
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['jazzCash', 'cod', 'creditCard']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for order total with shipping
OrderSchema.virtual('orderTotalWithShipping').get(function() {
  // Add shipping cost calculation logic here
  const shippingCost = 0; // Replace with actual shipping cost calculation
  return this.totalAmount + shippingCost;
});

// Method to check if a product can be reviewed
OrderSchema.methods.canReviewProduct = function(productId) {
  // Order must be delivered and payment completed
  if (this.status !== 'delivered' || this.paymentStatus !== 'completed') {
    return false;
  }

  // Find the product in the order
  const orderProduct = this.products.find(
    p => p.product.toString() === productId.toString()
  );

  // Check if product exists and hasn't been reviewed
  return orderProduct && !orderProduct.reviewed;
};

// Pre-save middleware to populate products
OrderSchema.pre('save', function(next) {
  // Ensure products array is not empty
  if (!this.products || this.products.length === 0) {
    next(new Error('Order must contain at least one product'));
    return;
  }
  next();
});

// Create indexes for better query performance
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ 'products.product': 1 });

module.exports = mongoose.model('Order', OrderSchema);
