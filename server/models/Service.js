const pool = require('../config/db');

// Service model
const Service = {
  // Find service by ID
  async findById(id) {
    try {
      const query = `
        SELECT s.*, u.email as creator_email
        FROM public.services s
               LEFT JOIN public.users u ON s.created_by = u.id
        WHERE s.id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Find service by ID error:', error);
      throw error;
    }
  },

  // Create new service
  async create(name, description, application, userId) {
    try {
      const query = 'INSERT INTO public.services (name, description, application, created_by) VALUES ($1, $2, $3, $4) RETURNING *';
      const values = [name, description, application, userId];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Create service error:', error);
      throw error;
    }
  },

  // Get all services
  async findAll() {
    try {
      const query = `
        SELECT s.*, u.email as creator_email
        FROM public.services s
               LEFT JOIN public.users u ON s.created_by = u.id
        ORDER BY s.created_at DESC
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Find all services error:', error);
      throw error;
    }
  },

  // Delete service
  async delete(id) {
    try {
      const query = 'DELETE FROM public.services WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Delete service error:', error);
      throw error;
    }
  }
};

module.exports = Service;
