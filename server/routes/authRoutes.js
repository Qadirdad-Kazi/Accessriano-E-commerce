const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registration route
router.post('/register', authController.registerUser);

// Login route
router.post('/login', authController.loginUser);

// Get user profile (Protected)
const authMiddleware = require('../middleware/auth');
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
