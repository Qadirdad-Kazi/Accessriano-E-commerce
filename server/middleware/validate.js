const AppError = require('../utils/appError');

/**
 * Validation middleware factory
 * @param {Object} schema - Joi schema for validation
 */
const validate = (schema) => (req, res, next) => {
    if (!schema) return next();

    const { error } = schema.validate(req.body, {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true
    });

    if (error) {
        const errorMessage = error.details
            .map(detail => detail.message)
            .join(', ');
            
        return next(new AppError(errorMessage, 400));
    }

    next();
};

module.exports = validate;
