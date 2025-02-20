const Category = require('../models/Category');
const Product = require('../models/Product'); 
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// ✅ Fetch all categories
exports.getAllCategories = catchAsync(async (req, res) => {
    const categories = await Category.find().sort('name');
    res.status(200).json({
        success: true,
        data: categories
    });
});

// ✅ Fetch a single category by ID
exports.getCategory = catchAsync(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        throw new AppError('Category not found', 404);
    }
    res.status(200).json({
        success: true,
        data: category
    });
});

// ✅ Fetch category along with all related products
exports.getCategoryWithProducts = catchAsync(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        throw new AppError('Category not found', 404);
    }

    // Fetch products and populate category field
    const products = await Product.find({ category: category._id }).populate('category');

    res.status(200).json({
        success: true,
        data: {
            category,
            products
        }
    });
});


// ✅ Create a new category (Admin Only)
exports.createCategory = catchAsync(async (req, res) => {
    if (!req.user || !req.user.isAdmin) {
        throw new AppError('Not authorized to create categories', 403);
    }
    const category = await Category.create(req.body);
    res.status(201).json({
        success: true,
        data: category
    });
});

// ✅ Update a category by ID (Admin Only)
exports.updateCategory = catchAsync(async (req, res) => {
    if (!req.user || !req.user.isAdmin) {
        throw new AppError('Not authorized to update categories', 403);
    }
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );
    if (!category) {
        throw new AppError('Category not found', 404);
    }
    res.status(200).json({
        success: true,
        data: category
    });
});

// ✅ Delete a category by ID (Admin Only)
exports.deleteCategory = catchAsync(async (req, res) => {
    if (!req.user || !req.user.isAdmin) {
        throw new AppError('Not authorized to delete categories', 403);
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
        throw new AppError('Category not found', 404);
    }
    res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
        data: {}
    });
});
