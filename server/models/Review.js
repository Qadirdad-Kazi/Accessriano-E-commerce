const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        required: true,
        trim: true,
        maxLength: 1000
    },
    images: [{
        type: String,
        validate: {
            validator: function(v) {
                // Basic URL validation
                return /^https?:\/\/.*/.test(v);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    }],
    verified: {
        type: Boolean,
        default: false
    },
    helpfulVotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reportedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Compound index to ensure one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to calculate average rating for a product
reviewSchema.statics.calculateAverageRating = async function(productId) {
    const stats = await this.aggregate([
        {
            $match: { product: productId }
        },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' },
                numberOfReviews: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            averageRating: Math.round(stats[0].averageRating * 10) / 10,
            numberOfReviews: stats[0].numberOfReviews
        });
    } else {
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            averageRating: 0,
            numberOfReviews: 0
        });
    }
};

// Update average rating after save
reviewSchema.post('save', function() {
    this.constructor.calculateAverageRating(this.product);
});

// Update average rating after update
reviewSchema.post('remove', function() {
    this.constructor.calculateAverageRating(this.product);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
