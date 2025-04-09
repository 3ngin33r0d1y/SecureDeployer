const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create a new pool using the connection string with SSL required
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl: {
        rejectUnauthorized: false // Use this for self-signed certificates
    }
});

async function addBranchNameField() {
    const client = await pool.connect();

    try {
        console.log('Connected to database. Adding branch_name field to deployments table...');

        // Read the SQL file
        const sqlFilePath = path.join(__dirname, 'add_branch_name_field.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        // Execute the SQL
        await client.query(sql);

        console.log('Successfully added branch_name field to deployments table.');
    } catch (err) {
        console.error('Error adding branch_name field:', err);
    } finally {
        client.release();
        pool.end();
    }
}

// Run the function
addBranchNameField();
