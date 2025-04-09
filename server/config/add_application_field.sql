-- Add application column to services table
ALTER TABLE services ADD COLUMN application VARCHAR(3);

-- Update existing services to have a default application (can be updated later)
UPDATE services SET application = 'abb' WHERE application IS NULL;
