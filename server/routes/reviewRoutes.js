const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { cache } = require('../middleware/cache');
const validate = require('../middleware/validate');
const { reviewSchema } = require('../validations/reviewValidation');

// Public routes with caching
router.get('/product/:productId', cache(300), reviewController.getProductReviews);

// Protected routes (logged in users)
router.use(auth);

// Create review with validation
router.post('/',  
    validate(reviewSchema),
    reviewController.createReview
);

// Update own review
router.put('/:id',
    validate(reviewSchema),
    reviewController.updateReview
);

// Delete own review
router.delete('/:id', reviewController.deleteReview);

// Admin-only delete route
router.delete('/admin/:id', reviewController.adminDeleteReview);

// Vote review as helpful
router.post('/:id/helpful', reviewController.voteHelpful);

// Report inappropriate review
router.post('/:id/report', reviewController.reportReview);

// Admin only routes
router.use(admin);

// Get all reviews with caching
router.get('/', cache(300), reviewController.getAllReviews);

// Get reported reviews
router.get('/reported', reviewController.getReportedReviews);

// Moderate a review
router.post('/:id/moderate', reviewController.moderateReview);

module.exports = router;