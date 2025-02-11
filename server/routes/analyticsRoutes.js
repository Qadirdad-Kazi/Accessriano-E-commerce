const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');       // Ensure only authenticated users access it
const adminAuth = require('../middleware/adminAuth'); // Ensure only admin users access it

// GET /api/analytics - Only admin users can access analytics data
router.get('/', auth, adminAuth, analyticsController.getAnalytics);

module.exports = router;
 