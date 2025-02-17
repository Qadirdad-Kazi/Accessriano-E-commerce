const Review = require('../models/Review');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createReview = catchAsync(async (req, res) => {
    // Check if user has purchased the product
    const hasPurchased = await Order.exists({
        user: req.user._id,
        'products.product': req.body.product,
        status: 'delivered'
    });

    if (!hasPurchased) {
        throw new AppError('You can only review products you have purchased', 403);
    }

    const review = await Review.create({
        ...req.body,
        user: req.user._id
    });

    await review.populate('user', 'name avatar');

    res.status(201).json({
        success: true,
        data: review
    });
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
    if (!req.user.isAdmin) {
        throw new AppError('Not authorized', 403);
    }

    const reviews = await Review.find({
        reportedBy: { $exists: true, $not: { $size: 0 } }
    })
        .populate('user', 'name email')
        .populate('product', 'name');

    res.status(200).json({
        success: true,
        data: reviews
    });
});

exports.moderateReview = catchAsync(async (req, res) => {
    if (!req.user.isAdmin) {
        throw new AppError('Not authorized', 403);
    }

    const { action } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
        throw new AppError('Review not found', 404);
    }

    if (action === 'remove') {
        await review.remove();
        res.status(200).json({
            success: true,
            message: 'Review removed successfully'
        });
    } else if (action === 'clear-reports') {
        review.reportedBy = [];
        await review.save();
        res.status(200).json({
            success: true,
            message: 'Reports cleared successfully'
        });
    } else {
        throw new AppError('Invalid action', 400);
    }
});
