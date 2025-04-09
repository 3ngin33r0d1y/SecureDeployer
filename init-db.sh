#!/bin/bash

# Script to run the database initialization

# Load environment variables
source .env

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js to continue."
    exit 1
fi

# Run the database initialization script
echo "Initializing database..."
node server/config/db-init.js

echo "Database initialization completed."
