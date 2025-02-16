const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Try to get token from different header formats
  const token = req.header('x-auth-token') || 
                (req.header('Authorization') || '').replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
};
