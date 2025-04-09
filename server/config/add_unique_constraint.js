const pool = require('../config/db');

// Script to add unique constraint to deployments table
async function addUniqueConstraint() {
    try {
        // Check if constraint already exists
        const checkConstraintQuery = `
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name='deployments' AND constraint_name='unique_service_version'
    `;

        const constraintCheck = await pool.query(checkConstraintQuery);

        if (constraintCheck.rows.length === 0) {
            // Add unique constraint to deployments table
            const addConstraintQuery = `ALTER TABLE deployments ADD CONSTRAINT unique_service_version UNIQUE (service_id, version)`;
            await pool.query(addConstraintQuery);
            console.log('Added unique constraint on service_id and version to deployments table');
        } else {
            console.log('Unique constraint already exists on deployments table');
        }

        console.log('Database schema update completed successfully');
    } catch (error) {
        console.error('Error updating database schema:', error);
    } finally {
        // Don't end the pool here as it might be used by other parts of the application
    }
}

// Execute the function
addUniqueConstraint();
