// server/middleware/adminAuth.js
module.exports = function (req, res, next) {
    // req.user is set by your auth middleware
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ message: 'Access denied: Admins only.' });
  };
  