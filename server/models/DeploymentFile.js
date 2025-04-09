const pool = require('../config/db');

// DeploymentFile model
const DeploymentFile = {
  // Find file by ID
  async findById(id) {
    try {
      const query = `
        SELECT df.*, u.email as uploader_email 
        FROM public.deployment_files df
        LEFT JOIN public.users u ON df.uploaded_by = u.id
        WHERE df.id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Find file by ID error:', error);
      throw error;
    }
  },

  // Create new file
  async create(deploymentId, fileName, filePath, fileType, fileSize, userId) {
    try {
      const query = 'INSERT INTO public.deployment_files (deployment_id, file_name, file_path, file_type, file_size, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
      const values = [deploymentId, fileName, filePath, fileType, fileSize, userId];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Create file error:', error);
      throw error;
    }
  },

  // Get files by deployment
  async findByDeployment(deploymentId) {
    try {
      const query = `
        SELECT df.*, u.email as uploader_email 
        FROM public.deployment_files df
        LEFT JOIN public.users u ON df.uploaded_by = u.id
        WHERE df.deployment_id = $1
        ORDER BY df.uploaded_at DESC
      `;
      const result = await pool.query(query, [deploymentId]);
      return result.rows;
    } catch (error) {
      console.error('Find files by deployment error:', error);
      throw error;
    }
  },

  // Delete file
  async delete(id) {
    try {
      const query = 'DELETE FROM public.deployment_files WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Delete file error:', error);
      throw error;
    }
  }
};

module.exports = DeploymentFile;
