const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createReview = catchAsync(async (req, res) => {
    console.log('Creating review with data:', req.body);
    console.log('User:', req.user);

    try {
        // Check if user has purchased the product
        const hasPurchased = await Order.exists({
            user: req.user._id,
            'products.product': req.body.productId,
            status: 'delivered',
            paymentStatus: 'completed'
        });

        console.log('Has purchased:', hasPurchased);

        if (!hasPurchased) {
            throw new AppError('You can only review products you have purchased and received', 403);
        }

        // Check if user has already reviewed this product
        const existingReview = await Review.findOne({
            user: req.user._id,
            product: req.body.productId
        });

        console.log('Existing review:', existingReview);

        if (existingReview) {
            throw new AppError('You have already reviewed this product', 400);
        }

        // Find the order to mark the product as reviewed
        const order = await Order.findOne({
            user: req.user._id,
            'products.product': req.body.productId,
            status: 'delivered'
        });

        if (order) {
            // Mark the specific product as reviewed
            const productItem = order.products.find(p => 
                p.product.toString() === req.body.productId.toString()
            );
            if (productItem) {
                productItem.reviewed = true;
                await order.save();
            }
        }

        const review = await Review.create({
            product: req.body.productId,
            user: req.user._id,
            rating: req.body.rating,
            title: req.body.title,
            review: req.body.content
        });

        console.log('Created review:', review);

        await review.populate('user', 'name avatar');

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Error in createReview:', error);
        throw error;
    }
});

exports.getProductReviews = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ product: req.params.productId })
        .populate('user', 'name avatar')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);

    const total = await Review.countDocuments({ product: req.params.productId });

    res.status(200).json({
        success: true,
        data: reviews,
        pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
        }
    });
});

exports.updateReview = catchAsync(async (req, res) => {
    const review = await Review.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body,
        { new: true, runValidators: true }
    );

    if (!review) {
        throw new AppError('Review not found or you are not authorized', 404);
    }

    await review.populate('user', 'name avatar');

    res.status(200).json({
        success: true,
        data: review
    });
});

exports.deleteReview = catchAsync(async (req, res) => {
    const review = await Review.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
    });

    if (!review) {
        throw new AppError('Review not found or you are not authorized', 404);
    }

    res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
    });
});

exports.voteHelpful = catchAsync(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        throw new AppError('Review not found', 404);
    }

    const hasVoted = review.helpfulVotes.includes(req.user._id);

    if (hasVoted) {
        review.helpfulVotes.pull(req.user._id);
    } else {
        review.helpfulVotes.push(req.user._id);
    }

    await review.save();

    res.status(200).json({
        success: true,
        data: review
    });
});

exports.reportReview = catchAsync(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        throw new AppError('Review not found', 404);
    }

    const hasReported = review.reportedBy.includes(req.user._id);

    if (hasReported) {
        throw new AppError('You have already reported this review', 400);
    }

    review.reportedBy.push(req.user._id);
    await review.save();

    // If review has been reported by multiple users, notify admin
    if (review.reportedBy.length >= 3) {
        // TODO: Implement admin notification system
    }

    res.status(200).json({
        success: true,
        message: 'Review reported successfully'
    });
});

// Admin only endpoints
exports.getReportedReviews = catchAsync(async (req, res) => {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
        throw new AppError('Not authorized to access this route', 403);
    }

    const reviews = await Review.find({ reportedBy: { $exists: true, $not: { $size: 0 } } })
        .populate('user', 'name avatar')
        .populate('product', 'name images')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        data: reviews
    }); 
});

exports.getAllReviews = catchAsync(async (req, res) => {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
        throw new AppError('Not authorized to access this route', 403);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find()
        .populate('user', 'name email')
        .populate('product', 'name images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Review.countDocuments();

    res.status(200).json({
        success: true,
        data: reviews,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

exports.adminDeleteReview = catchAsync(async (req, res) => {
    // Check if review exists
    const review = await Review.findById(req.params.id);
    if (!review) {
        throw new AppError('Review not found', 404);
    }

    // Delete the review
    await review.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Review deleted successfully by admin'
    });
});


exports.moderateReview = catchAsync(async (req, res) => {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
        throw new AppError('Not authorized to access this route', 403);
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
        throw new AppError('Review not found', 404);
    }

    // Update review moderation status
    review.verified = req.body.verified;
    if (req.body.delete) {
        await review.remove();
        return res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    }

    await review.save();

    res.status(200).json({
        success: true,
        data: review
    });
});
