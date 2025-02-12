const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// ✅ Registration route
router.post('/register', authController.registerUser);

// ✅ Login route
router.post('/login', authController.loginUser);

// ✅ Get user profile (protected)
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
