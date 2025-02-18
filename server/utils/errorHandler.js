// Async error handler wrapper
exports.catchAsync = fn => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Custom error class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Global error handler middleware
exports.errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Development error response
    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            success: false,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } 
    // Production error response
    else {
        // Operational, trusted error: send message to client
        if (err.isOperational) {
            res.status(err.statusCode).json({
                success: false,
                message: err.message
            });
        }
        // Programming or other unknown error: don't leak error details
        else {
            console.error('ERROR 💥', err);
            res.status(500).json({
                success: false,
                message: 'Something went wrong!'
            });
        }
    }
};

exports.AppError = AppError;
