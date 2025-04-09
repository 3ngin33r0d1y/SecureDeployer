const pool = require('../config/db');

// Script to add application field to services table
async function addApplicationField() {
    try {
        // Check if application column already exists
        const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='services' AND column_name='application'
    `;

        const columnCheck = await pool.query(checkColumnQuery);

        if (columnCheck.rows.length === 0) {
            // Add application column to services table
            const addColumnQuery = `ALTER TABLE services ADD COLUMN application VARCHAR(3)`;
            await pool.query(addColumnQuery);
            console.log('Added application column to services table');

            // Update existing services to have a default application
            const updateQuery = `UPDATE services SET application = 'abb' WHERE application IS NULL`;
            await pool.query(updateQuery);
            console.log('Updated existing services with default application value');
        } else {
            console.log('Application column already exists in services table');
        }

        console.log('Database schema update completed successfully');
    } catch (error) {
        console.error('Error updating database schema:', error);
    } finally {
        // Don't end the pool here as it might be used by other parts of the application
    }
}

// Execute the function
addApplicationField();
