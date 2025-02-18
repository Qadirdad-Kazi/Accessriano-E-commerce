const User = require('../models/User');

module.exports = async function(req, res, next) {
  try {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized to access this route' 
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin only.' 
      });
    }

    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server Error',
      error: err.message 
    });
  }
};
