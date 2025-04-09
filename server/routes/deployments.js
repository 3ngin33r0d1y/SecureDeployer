const express = require('express');
const router = express.Router();
const DeploymentController = require('../controllers/DeploymentController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const create = require('../middleware/create');

// @route   POST /api/deployments
// @desc    Create a new deployment (legacy method without file)
// @access  Private (All authenticated users)
router.post('/', [auth, create], DeploymentController.createDeployment);

// @route   POST /api/deployments/with-file
// @desc    Create a new deployment with mandatory file upload
// @access  Private (All authenticated users)
router.post('/with-file', [auth, create, DeploymentController.uploadMiddleware], 
  DeploymentController.createDeploymentWithFile);

// @route   GET /api/deployments
// @desc    Get all deployments
// @access  Private
router.get('/', auth, DeploymentController.getAllDeployments);

// @route   GET /api/deployments/:id
// @desc    Get deployment by ID
// @access  Private
router.get('/:id', auth, DeploymentController.getDeploymentById);

// @route   GET /api/deployments/service/:serviceId
// @desc    Get deployments by service ID
// @access  Private
router.get('/service/:serviceId', auth, DeploymentController.getDeploymentsByServiceId);

// @route   POST /api/deployments/:deploymentId/files
// @desc    Upload deployment file
// @access  Admin
router.post('/:deploymentId/files', [auth, admin, DeploymentController.uploadMiddleware], 
  DeploymentController.uploadDeploymentFile);

// @route   GET /api/deployments/files/:fileId
// @desc    Get deployment file
// @access  Private
router.get('/files/:fileId', auth, DeploymentController.getDeploymentFile);

// @route   DELETE /api/deployments/:id
// @desc    Delete deployment
// @access  Admin
router.delete('/:id', [auth, admin], DeploymentController.deleteDeployment);

module.exports = router;
