const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET /api/users
// @desc    Get all users
// @access  Admin
router.get('/', [auth, admin], UserController.getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Admin
router.get('/:id', [auth, admin], UserController.getUserById);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Admin
router.delete('/:id', [auth, admin], UserController.deleteUser);

module.exports = router;
