const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', AuthController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', AuthController.login);

// @route   GET /api/auth/logout
// @desc    Logout user
// @access  Private
router.get('/logout', auth, AuthController.logout);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, AuthController.getCurrentUser);

module.exports = router;
