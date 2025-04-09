const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create a connection pool
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false
  }
});

// Function to initialize the database
async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database.');
    
    // Check if admin user exists
    const checkResult = await client.query('SELECT * FROM users WHERE email = $1', ['admin@example.com']);
    
    if (checkResult.rows.length === 0) {
      console.log('Creating admin user...');
      // Insert admin user with plain text password for easier testing
      await client.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
        ['admin@example.com', 'admin123', 'admin']
      );
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists, updating password...');
      // Update admin user password to plain text for easier testing
      await client.query(
        'UPDATE users SET password = $1 WHERE email = $2',
        ['admin123', 'admin@example.com']
      );
      console.log('Admin user password updated successfully');
    }
    
    console.log('Database initialized successfully');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('Database setup complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('Database setup failed:', err);
    process.exit(1);
  });
