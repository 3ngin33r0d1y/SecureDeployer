const express = require('express');
const router = express.Router();
const ServiceController = require('../controllers/ServiceController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const create = require('../middleware/create');

// @route   POST /api/services
// @desc    Create a new service
// @access  Private (All authenticated users)
router.post('/', [auth, create], ServiceController.createService);

// @route   GET /api/services
// @desc    Get all services
// @access  Private
router.get('/', auth, ServiceController.getAllServices);

// @route   GET /api/services/:id
// @desc    Get service by ID
// @access  Private
router.get('/:id', auth, ServiceController.getServiceById);

// @route   PUT /api/services/:id
// @desc    Update service
// @access  Admin
router.put('/:id', [auth, admin], ServiceController.updateService);

// @route   DELETE /api/services/:id
// @desc    Delete service
// @access  Admin
router.delete('/:id', [auth, admin], ServiceController.deleteService);

module.exports = router;
