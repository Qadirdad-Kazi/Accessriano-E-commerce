const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true,
    maxLength: [100, 'Product name cannot exceed 100 characters']
  },
  sku: {
    type: String,
    required: [true, 'Please enter product SKU'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please enter product description'],
    maxLength: [2000, 'Product description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative']
  },
  discountPercentage: {
    type: Number,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100']
  },
  onSale: {
    type: Boolean,
    default: false
  },
  brand: {
    type: String,
    required: [true, 'Please enter product brand']
  },
  images: [{
    type: String,
    required: true
  }],
  qrCode: {
    type: String,
    required: false
  },
  category: {
    type: String,
    required: [true, 'Please select category for this product'],
    enum: {
      values: [
        'Electronics',
        'Cameras',
        'Laptops',
        'Accessories',
        'Headphones',
        'Sports',
        'Books',
        'Clothes/Shoes',
        'Beauty/Health',
        'Outdoor',
        'Home'
      ],
      message: 'Please select correct category for product'
    }
  },
  seller: {
    type: String,
    required: [true, 'Please enter product seller']
  },
  stock: {
    type: Number,
    required: [true, 'Please enter product stock'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  specifications: [{
    name: { type: String, required: true },
    value: { type: String, required: true }
  }],
  variants: [{
    color: String,
    size: String,
    stock: Number,
    price: Number
  }],
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'in'],
      default: 'cm'
    }
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'g', 'lb', 'oz'],
      default: 'g'
    }
  },
  ratings: {
    type: Number,
    default: 0
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      rating: {
        type: Number,
        required: true
      },
      comment: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate average rating before saving
ProductSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    this.ratings = this.reviews.reduce((acc, item) => item.rating + acc, 0) / this.reviews.length;
  }
  this.numOfReviews = this.reviews.length;
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
