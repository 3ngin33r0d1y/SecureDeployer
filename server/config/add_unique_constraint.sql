-- Add unique constraint to deployments table for service_id and version
ALTER TABLE deployments ADD CONSTRAINT unique_service_version UNIQUE (service_id, version);
