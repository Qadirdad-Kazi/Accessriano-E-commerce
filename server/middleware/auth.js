const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from the header. (You can also set it in a cookie or request body as per your design.)
  const token = req.header('x-auth-token');

  // Check if no token is provided.
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token.
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Save the user info from token to the request object.
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
