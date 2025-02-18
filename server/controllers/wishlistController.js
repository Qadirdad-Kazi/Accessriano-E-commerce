const User = require('../models/User');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getWishlist = catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate({
            path: 'wishlist.product',
            select: 'name price description images stock'
        });

    res.status(200).json({
        success: true,
        data: user.wishlist || []
    });
});

exports.addToWishlist = catchAsync(async (req, res) => {
    const productId = req.params.productId;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        throw new AppError('Product not found', 404);
    }

    // Add to wishlist if not already present
    const user = await User.findById(req.user._id);
    const isInWishlist = user.wishlist.some(item => 
        item.product.toString() === productId
    );

    if (!isInWishlist) {
        user.wishlist.push({ product: productId });
        await user.save();
    }

    res.status(200).json({
        success: true,
        message: 'Product added to wishlist'
    });
});

exports.removeFromWishlist = catchAsync(async (req, res) => {
    const productId = req.params.productId;

    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(item => 
        item.product.toString() !== productId
    );
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Product removed from wishlist'
    });
});
