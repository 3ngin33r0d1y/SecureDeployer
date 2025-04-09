const Service = require('../models/Service');

// Service Controller
const ServiceController = {
  // Create a new service
  async createService(req, res) {
    const { name, description, application } = req.body;

    try {
      const service = await Service.create(name, description, application, req.user.id);
      res.status(201).json({ success: true, service });
    } catch (error) {
      console.error('Create service error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get all services
  async getAllServices(req, res) {
    try {
      const services = await Service.findAll();
      res.json({ success: true, services });
    } catch (error) {
      console.error('Get all services error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get service by ID
  async getServiceById(req, res) {
    try {
      const service = await Service.findById(req.params.id);
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      res.json({ success: true, service });
    } catch (error) {
      console.error('Get service by ID error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update service
  async updateService(req, res) {
    const { name, description } = req.body;

    try {
      const service = await Service.update(req.params.id, name, description);
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      res.json({ success: true, service });
    } catch (error) {
      console.error('Update service error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Delete service
  async deleteService(req, res) {
    try {
      const service = await Service.delete(req.params.id);
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      res.json({ success: true, message: 'Service deleted successfully' });
    } catch (error) {
      console.error('Delete service error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = ServiceController;
