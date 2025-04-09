-- Add branch_name column to deployments table
ALTER TABLE deployments ADD COLUMN branch_name VARCHAR(255) DEFAULT 'main';
