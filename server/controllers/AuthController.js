const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { comparePassword } = require('../config/security');

// Auth Controller
const AuthController = {
  // Register user
  async register(req, res) {
    const { email, password, role } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create user with plain text password for testing
      const user = await User.create(email, password, role || 'user');

      // Generate JWT token
      const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET || 'fallback_secret_key',
          { expiresIn: process.env.JWT_EXPIRE || '24h' }
      );

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Login user
  async login(req, res) {
    const { email, password } = req.body;

    try {
      // Check if user exists
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      console.log('Login attempt:', {
        email,
        providedPassword: password,
        storedPassword: user.password
      });

      // Direct plain text password comparison
      const isMatch = (password === user.password);
      console.log('Password match result:', isMatch);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET || 'fallback_secret_key',
          { expiresIn: process.env.JWT_EXPIRE || '24h' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Logout user
  logout(req, res) {
    // JWT is stateless, so we just return success
    // Client-side should remove the token
    res.json({ success: true, message: 'Logged out successfully' });
  },

  // Get current user
  async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = AuthController;