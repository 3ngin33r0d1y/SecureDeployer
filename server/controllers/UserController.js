const User = require('../models/User');

// User Controller
const UserController = {
  // Get all users
  async getAllUsers(req, res) {
    try {
      const users = await User.findAll();
      res.json({ success: true, users });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get user by ID
  async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Don't return password
      const { password, ...userData } = user;
      res.json({ success: true, user: userData });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Delete user
  async deleteUser(req, res) {
    try {
      const user = await User.delete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = UserController;
