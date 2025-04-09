// Create middleware - checks if user can create resources
module.exports = function(req, res, next) {
  // Both admin and regular users can create resources
  if (req.user) {
    next();
  } else {
    res.status(401).json({ message: 'Authentication required.' });
  }
};
