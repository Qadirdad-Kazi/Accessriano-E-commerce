const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');       // Ensure only authenticated users access it
const adminAuth = require('../middleware/adminAuth'); // Ensure only admin users access it

// All routes require authentication and admin privileges
router.use(auth, adminAuth);

// GET /api/analytics/dashboard - Get dashboard analytics
router.get('/dashboard', analyticsController.getDashboardAnalytics);

// GET /api/analytics/sales - Get sales analytics
router.get('/sales', analyticsController.getSalesAnalytics);

// GET /api/analytics/categories - Get category analytics
router.get('/categories', analyticsController.getCategoryAnalytics);

// GET /api/analytics - Only admin users can access analytics data
router.get('/', analyticsController.getAnalytics);

module.exports = router;