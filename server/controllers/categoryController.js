const Category = require('../models/Category');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllCategories = catchAsync(async (req, res) => {
    const categories = await Category.find().sort('name');
    res.status(200).json({
        success: true,
        data: categories
    });
});

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

exports.createCategory = catchAsync(async (req, res) => {
    if (!req.user.isAdmin) {
        throw new AppError('Not authorized to create categories', 403);
    }
    const category = await Category.create(req.body);
    res.status(201).json({
        success: true,
        data: category
    });
});

exports.updateCategory = catchAsync(async (req, res) => {
    if (!req.user.isAdmin) {
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

exports.deleteCategory = catchAsync(async (req, res) => {
    if (!req.user.isAdmin) {
        throw new AppError('Not authorized to delete categories', 403);
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
        throw new AppError('Category not found', 404);
    }
    res.status(200).json({
        success: true,
        data: {}
    });
});
