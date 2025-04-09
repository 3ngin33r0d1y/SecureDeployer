const pool = require('../config/db');

// Script to handle existing duplicate deployments and add unique constraint
async function handleDuplicatesAndAddConstraint() {
    const client = await pool.connect();

    try {
        // Start transaction
        await client.query('BEGIN');

        // Find duplicate service_id and version combinations
        const findDuplicatesQuery = `
      SELECT service_id, version, COUNT(*) as count
      FROM deployments
      GROUP BY service_id, version
      HAVING COUNT(*) > 1
    `;

        const duplicatesResult = await client.query(findDuplicatesQuery);
        const duplicates = duplicatesResult.rows;

        if (duplicates.length > 0) {
            console.log(`Found ${duplicates.length} duplicate service_id and version combinations`);

            // For each duplicate set, keep the newest one and update the others
            for (const duplicate of duplicates) {
                const { service_id, version } = duplicate;

                // Get all deployments with this service_id and version, ordered by created_at
                const getDeploymentsQuery = `
          SELECT id, created_at
          FROM deployments
          WHERE service_id = $1 AND version = $2
          ORDER BY created_at DESC
        `;

                const deploymentsResult = await client.query(getDeploymentsQuery, [service_id, version]);
                const deployments = deploymentsResult.rows;

                // Keep the newest one (first in the array) and update the others
                const keepId = deployments[0].id;
                console.log(`Keeping deployment ${keepId} for service_id=${service_id}, version=${version}`);

                for (let i = 1; i < deployments.length; i++) {
                    const updateId = deployments[i].id;
                    // Append a suffix to make the version unique
                    const newVersion = `${version}-duplicate-${i}`;

                    const updateQuery = `
            UPDATE deployments
            SET version = $1
            WHERE id = $2
          `;

                    await client.query(updateQuery, [newVersion, updateId]);
                    console.log(`Updated deployment ${updateId} to version ${newVersion}`);
                }
            }
        } else {
            console.log('No duplicate service_id and version combinations found');
        }

        // Check if constraint already exists
        const checkConstraintQuery = `
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name='deployments' AND constraint_name='unique_service_version'
    `;

        const constraintCheck = await client.query(checkConstraintQuery);

        if (constraintCheck.rows.length === 0) {
            // Add unique constraint to deployments table
            const addConstraintQuery = `ALTER TABLE deployments ADD CONSTRAINT unique_service_version UNIQUE (service_id, version)`;
            await client.query(addConstraintQuery);
            console.log('Added unique constraint on service_id and version to deployments table');
        } else {
            console.log('Unique constraint already exists on deployments table');
        }

        // Commit transaction
        await client.query('COMMIT');
        console.log('Database schema update completed successfully');
    } catch (error) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        console.error('Error updating database schema:', error);
    } finally {
        client.release();
    }
}

// Execute the function
handleDuplicatesAndAddConstraint();
