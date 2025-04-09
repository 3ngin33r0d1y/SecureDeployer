const { Pool } = require('pg');
const dotenv = require('dotenv');
const { getDatabaseCredentials } = require('./vault');

dotenv.config();

// Create a pool with default values from environment variables
// These will be overridden with values from Vault when available
let pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false // This allows self-signed certificates
  }
});

// Initialize database connection with credentials from Vault
async function initializeDbConnection() {
  try {
    // Get database credentials from Vault
    const dbCredentials = await getDatabaseCredentials();
    
    // Close existing pool if it exists
    if (pool) {
      await pool.end();
    }
    
    // Create a new pool with credentials from Vault
    pool = new Pool({
      user: dbCredentials.PGUSER,
      host: dbCredentials.PGHOST,
      database: dbCredentials.PGDATABASE,
      password: dbCredentials.PGPASSWORD,
      port: dbCredentials.PGPORT,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    // Set search path to public schema on connection
    pool.on('connect', (client) => {
      client.query('SET search_path TO public');
    });
    
    console.log('Database connection initialized with credentials from Vault');
    return pool;
  } catch (error) {
    console.error('Error initializing database connection with Vault credentials:', error.message);
    console.log('Falling back to environment variables for database connection');
    
    // If Vault authentication fails, we'll continue using the environment variables
    pool.on('connect', (client) => {
      client.query('SET search_path TO public');
    });
    
    return pool;
  }
}

// Initialize the connection when this module is imported
initializeDbConnection().catch(err => {
  console.error('Failed to initialize database connection:', err.message);
});

module.exports = pool;
