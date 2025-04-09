// Admin middleware - checks if user has admin role
module.exports = function(req, res, next) {
  // Check user role
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};
