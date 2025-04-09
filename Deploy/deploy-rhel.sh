#!/bin/bash

# Deployment script for Deployment Tracker application on RHEL
# This script sets up the application to run on a single port with Fabio reverse proxy
# Uses an external PostgreSQL service instead of installing locally

# Exit on any error
set -e

# Configuration
APP_DIR="/opt/deployment-tracker"
NODE_VERSION="16"

echo "=== Deployment Tracker Installation Script for RHEL ==="
echo "This script will install and configure the Deployment Tracker application"
echo "to run on a single port with Fabio reverse proxy."
echo "This script assumes PostgreSQL is available as an external service."
echo ""

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root" >&2
    exit 1
fi

# Create application directory
echo "Creating application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# Install dependencies
echo "Installing system dependencies..."
dnf update -y
dnf install -y curl wget git make gcc gcc-c++

# Install Node.js
echo "Installing Node.js $NODE_VERSION..."
dnf module enable -y nodejs:$NODE_VERSION
dnf install -y nodejs

# Prompt for PostgreSQL connection details
echo "Please enter your external PostgreSQL connection details:"
read -p "PostgreSQL Host: " PG_HOST
read -p "PostgreSQL Port (default: 5432): " PG_PORT
PG_PORT=${PG_PORT:-5432}
read -p "PostgreSQL Database Name: " PG_DATABASE
read -p "PostgreSQL Username: " PG_USER
read -s -p "PostgreSQL Password: " PG_PASSWORD
echo ""

# Test PostgreSQL connection
echo "Testing PostgreSQL connection..."
if command -v psql &> /dev/null; then
    # If psql is available, use it to test the connection
    PGPASSWORD=$PG_PASSWORD psql -h $PG_HOST -p $PG_PORT -U $PG_USER -d $PG_DATABASE -c "SELECT 1" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "Failed to connect to PostgreSQL. Please check your connection details and try again."
        exit 1
    fi
else
    # If psql is not available, install the PostgreSQL client
    echo "PostgreSQL client not found. Installing..."
    dnf install -y postgresql

    PGPASSWORD=$PG_PASSWORD psql -h $PG_HOST -p $PG_PORT -U $PG_USER -d $PG_DATABASE -c "SELECT 1" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "Failed to connect to PostgreSQL. Please check your connection details and try again."
        exit 1
    fi
fi

echo "PostgreSQL connection successful!"

# Clone or copy application code
echo "Copying application code..."
# Assuming the application code is in the current directory or will be copied manually
# You can replace this with a git clone command if your code is in a repository

# Install application dependencies
echo "Installing application dependencies..."
cd $APP_DIR
npm install
cd $APP_DIR/client
npm install

# Build the React frontend
echo "Building React frontend..."
cd $APP_DIR/client
npm run build

# Create .env file
echo "Creating environment configuration..."
cat > $APP_DIR/.env << EOL
NODE_ENV=production
PORT=8443

# PostgreSQL Configuration
PGUSER=$PG_USER
PGHOST=$PG_HOST
PGPASSWORD=$PG_PASSWORD
PGDATABASE=$PG_DATABASE
PGPORT=$PG_PORT

# JWT Secret
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRE=24h
EOL

# Create production server file
echo "Creating production server configuration..."
cat > $APP_DIR/production-server.js << EOL
const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Import routes
const authRoutes = require('./server/routes/auth');
const userRoutes = require('./server/routes/users');
const serviceRoutes = require('./server/routes/services');
const deploymentRoutes = require('./server/routes/deployments');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/deployments', deploymentRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 8443;
app.listen(PORT, () => {
  console.log(\`Server running in \${process.env.NODE_ENV} mode on port \${PORT}\`);
});
EOL


# Create systemd service file
echo "Creating systemd service..."
cat > /etc/systemd/system/deployment-tracker.service << EOL
[Unit]
Description=Deployment Tracker Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node production-server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOL

# Enable and start the service
echo "Enabling and starting the service..."
systemctl daemon-reload
systemctl enable deployment-tracker
systemctl start deployment-tracker


echo ""
echo "=== Installation Complete ==="
echo "Deployment Tracker is now running on port 8443"
echo "and is accessible through Fabio reverse proxy."
echo ""
echo "Default admin credentials:"
echo "Email: admin@example.com"
echo "Password: admin123"
echo ""
echo "Please change these credentials after first login!"
