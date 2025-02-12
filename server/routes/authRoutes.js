const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/profile', auth, authController.getProfile);

module.exports = router;
