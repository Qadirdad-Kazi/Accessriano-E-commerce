const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Registration endpoint
router.post('/register', authController.registerUser);

// Login endpoint
router.post('/login', authController.loginUser);

// Profile endpoint (protected)
router.get('/profile', auth, authController.getProfile);

module.exports = router;
