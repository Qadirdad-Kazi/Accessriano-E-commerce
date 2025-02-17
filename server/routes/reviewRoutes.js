const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/auth');

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);

// Protected routes (logged in users)
router.use(protect);

router.post('/', reviewController.createReview);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.post('/:id/helpful', reviewController.voteHelpful);
router.post('/:id/report', reviewController.reportReview);

// Admin only routes
router.use(restrictTo('admin'));
router.get('/reported', reviewController.getReportedReviews);
router.post('/:id/moderate', reviewController.moderateReview);

module.exports = router;
