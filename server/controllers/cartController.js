const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { catchAsync } = require('../utils/errorHandler');

// Get user's cart
exports.getCart = catchAsync(async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    let cart = await Cart.findOne({ user: req.user.id })
        .populate('items.product');

    if (!cart) {
        cart = await Cart.create({
            user: req.user.id,
            items: []
        });
    }

    res.status(200).json({
        success: true,
        data: cart
    });
});

// Add item to cart
exports.addToCart = catchAsync(async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    const { productId, quantity } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    // Check stock
    if (product.stock < quantity) {
        return res.status(400).json({
            success: false,
            message: 'Insufficient stock'
        });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        cart = await Cart.create({
            user: req.user.id,
            items: [{ product: productId, quantity }]
        });
    } else {
        // Check if product already exists in cart
        const existingItem = cart.items.find(item => 
            item.product.toString() === productId
        );

        if (existingItem) {
            // Update quantity if product exists
            existingItem.quantity = quantity;
        } else {
            // Add new item if product doesn't exist
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
    }

    // Populate product details before sending response
    await cart.populate('items.product');

    res.status(200).json({
        success: true,
        data: cart
    });
});

// Update cart item quantity
exports.updateCartItem = catchAsync(async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        return res.status(404).json({
            success: false,
            message: 'Cart not found'
        });
    }

    const cartItem = cart.items.find(item => 
        item.product.toString() === productId
    );

    if (!cartItem) {
        return res.status(404).json({
            success: false,
            message: 'Item not found in cart'
        });
    }

    // Check stock
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    if (product.stock < quantity) {
        return res.status(400).json({
            success: false,
            message: 'Insufficient stock'
        });
    }

    cartItem.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
        success: true,
        data: cart
    });
});

// Remove item from cart
exports.removeFromCart = catchAsync(async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        return res.status(404).json({
            success: false,
            message: 'Cart not found'
        });
    }

    cart.items = cart.items.filter(item => 
        item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
        success: true,
        data: cart
    });
});

// Clear cart
exports.clearCart = catchAsync(async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        return res.status(404).json({
            success: false,
            message: 'Cart not found'
        });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
        success: true,
        data: cart
    });
});
