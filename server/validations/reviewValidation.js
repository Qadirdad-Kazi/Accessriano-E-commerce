const Joi = require('joi');

const reviewSchema = Joi.object({
    productId: Joi.string()
        .required()
        .messages({
            'string.empty': 'Product ID is required',
            'any.required': 'Product ID is required'
        }),
    
    rating: Joi.number()
        .min(1)
        .max(5)
        .required()
        .messages({
            'number.base': 'Rating must be a number',
            'number.min': 'Rating must be at least 1',
            'number.max': 'Rating cannot be more than 5',
            'any.required': 'Rating is required'
        }),
    
    title: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Review title is required',
            'string.min': 'Review title must be at least 3 characters long',
            'string.max': 'Review title cannot exceed 100 characters',
            'any.required': 'Review title is required'
        }),
    
    content: Joi.string()
        .min(10)
        .max(1000)
        .required()
        .messages({
            'string.empty': 'Review content is required',
            'string.min': 'Review content must be at least 10 characters long',
            'string.max': 'Review content cannot exceed 1000 characters',
            'any.required': 'Review content is required'
        }),
    
    images: Joi.array()
        .items(Joi.string().uri())
        .max(5)
        .messages({
            'array.max': 'Cannot upload more than 5 images',
            'string.uri': 'Invalid image URL format'
        }),
    
    pros: Joi.array()
        .items(Joi.string().min(3).max(100))
        .max(5)
        .messages({
            'array.max': 'Cannot add more than 5 pros',
            'string.min': 'Each pro must be at least 3 characters long',
            'string.max': 'Each pro cannot exceed 100 characters'
        }),
    
    cons: Joi.array()
        .items(Joi.string().min(3).max(100))
        .max(5)
        .messages({
            'array.max': 'Cannot add more than 5 cons',
            'string.min': 'Each con must be at least 3 characters long',
            'string.max': 'Each con cannot exceed 100 characters'
        }),
    
    verifiedPurchase: Joi.boolean()
        .default(false)
});

module.exports = {
    reviewSchema
};
