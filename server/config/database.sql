-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create services table
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create deployments table
CREATE TABLE deployments (
  id SERIAL PRIMARY KEY,
  service_id INTEGER REFERENCES services(id),
  version VARCHAR(100) NOT NULL,
  changes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create deployment_files table
CREATE TABLE deployment_files (
  id SERIAL PRIMARY KEY,
  deployment_id INTEGER REFERENCES deployments(id),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (email, password, role) 
VALUES ('admin@example.com', '$2b$10$X/QQNrIQQQQQQQQQQQQQQOQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ', 'admin');
-- Note: The password hash above is a placeholder. It will be replaced with a proper bcrypt hash.
