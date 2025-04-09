const pool = require('../config/db');

// User model
const User = {
  // Find user by ID
  async findById(id) {
    try {
      const query = 'SELECT * FROM public.users WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Find user by ID error:', error);
      throw error;
    }
  },

  // Find user by email
  async findByEmail(email) {
    try {
      const query = 'SELECT * FROM public.users WHERE email = $1';
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Find user by email error:', error);
      throw error;
    }
  },

  // Create new user
  async create(email, password, role = 'user') {
    try {
      const query = 'INSERT INTO public.users (email, password, role) VALUES ($1, $2, $3) RETURNING *';
      const values = [email, password, role];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  // Get all users
  async findAll() {
    try {
      const query = 'SELECT id, email, role, created_at FROM public.users ORDER BY created_at DESC';
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Find all users error:', error);
      throw error;
    }
  },

  // Delete user
  async delete(id) {
    try {
      const query = 'DELETE FROM public.users WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }
};

module.exports = User;
