const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  try {
    // Try to get token from different header formats
    const token = req.header('x-auth-token') || 
                 (req.header('Authorization') || '').replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Check if user still exists
    const user = await User.findById(decoded.user.id || decoded.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.'
      });
    }

    // Add user to request with consistent id field
    req.user = {
      id: user._id.toString(), // Ensure id is a string
      _id: user._id.toString(), // Keep _id for backward compatibility
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Invalid token.',
      error: error.message
    });
  }
};
