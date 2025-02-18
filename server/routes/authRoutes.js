const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { sendResetEmail } = require('../services/emailService');
const { generateResetToken } = require('../services/tokenService');
const User = require('../models/User'); // Assuming User model is defined in this file
const bcrypt = require('bcrypt'); // Assuming bcrypt is installed and required

// Registration route
router.post('/register', authController.registerUser);

// Login route
router.post('/login', authController.loginUser);

// Password reset request endpoint
router.post('/request-password-reset', async (req, res) => {
    const { email } = req.body;
    // Logic to generate a reset token and send email
    const token = await generateResetToken(email);
    await sendResetEmail(email, token);
    return res.status(200).json({ message: 'Password reset link sent.' });
});

// Password reset endpoint
router.post('/reset-password', async (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;
    // Logic to validate the token and update the password
    const user = await User.findOne({ resetToken: token });
    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token.' });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetToken = null;
    await user.save();
    return res.status(200).json({ message: 'Password has been reset successfully.' });
});

// Get user profile (Protected)
const authMiddleware = require('../middleware/auth');
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
