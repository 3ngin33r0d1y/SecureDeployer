const pool = require('../config/db');

// Deployment model
const Deployment = {
  // Find deployment by ID
  async findById(id) {
    try {
      const query = `
        SELECT d.*, s.name as service_name, s.application, u.email as creator_email 
        FROM public.deployments d
        LEFT JOIN public.services s ON d.service_id = s.id
        LEFT JOIN public.users u ON d.created_by = u.id
        WHERE d.id = $1
      `;
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      // Get files for this deployment
      const filesQuery = `
        SELECT df.*, u.email as uploader_email
        FROM public.deployment_files df
        LEFT JOIN public.users u ON df.uploaded_by = u.id
        WHERE df.deployment_id = $1
        ORDER BY df.uploaded_at DESC
      `;
      const filesResult = await pool.query(filesQuery, [id]);

      const deployment = result.rows[0];
      deployment.files = filesResult.rows;

      return deployment;
    } catch (error) {
      console.error('Find deployment by ID error:', error);
      throw error;
    }
  },

  // Check if a deployment with the same service and version already exists
  async checkVersionExists(serviceId, version) {
    try {
      const query = 'SELECT id FROM public.deployments WHERE service_id = $1 AND version = $2';
      const result = await pool.query(query, [serviceId, version]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Check version exists error:', error);
      throw error;
    }
  },

  // Create new deployment
  async create(serviceId, version, changes, userId, branchName) {
    try {
      // First check if a deployment with this service and version already exists
      const versionExists = await this.checkVersionExists(serviceId, version);
      if (versionExists) {
        throw new Error('A deployment with this version already exists for this service');
      }

      // Get the service to include its application
      const serviceQuery = 'SELECT application FROM public.services WHERE id = $1';
      const serviceResult = await pool.query(serviceQuery, [serviceId]);
      const application = serviceResult.rows[0]?.application;

      const query = 'INSERT INTO public.deployments (service_id, version, changes, created_by, branch_name) VALUES ($1, $2, $3, $4, $5) RETURNING *';
      const values = [serviceId, version, changes, userId, branchName || 'main'];
      const result = await pool.query(query, values);

      // Add the application to the returned deployment object
      const deployment = result.rows[0];
      deployment.application = application;

      return deployment;
    } catch (error) {
      console.error('Create deployment error:', error);
      throw error;
    }
  },

  // Get all deployments
  async findAll() {
    try {
      const query = `
        SELECT d.*, s.name as service_name, s.application, u.email as creator_email
        FROM public.deployments d
               LEFT JOIN public.services s ON d.service_id = s.id
               LEFT JOIN public.users u ON d.created_by = u.id
        ORDER BY d.created_at DESC
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Find all deployments error:', error);
      throw error;
    }
  },

  // Get deployments by service
  async findByService(serviceId) {
    try {
      const query = `
        SELECT d.*, s.name as service_name, s.application, u.email as creator_email
        FROM public.deployments d
               LEFT JOIN public.services s ON d.service_id = s.id
               LEFT JOIN public.users u ON d.created_by = u.id
        WHERE d.service_id = $1
        ORDER BY d.created_at DESC
      `;
      const result = await pool.query(query, [serviceId]);
      return result.rows;
    } catch (error) {
      console.error('Find deployments by service error:', error);
      throw error;
    }
  },

  // Delete deployment
  async delete(id) {
    try {
      // First delete all files associated with this deployment
      await pool.query('DELETE FROM public.deployment_files WHERE deployment_id = $1', [id]);

      // Then delete the deployment
      const query = 'DELETE FROM public.deployments WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Delete deployment error:', error);
      throw error;
    }
  }
};

module.exports = Deployment;
