# Deployment Tracker - RHEL Deployment Guide with External PostgreSQL

This guide provides instructions for deploying the Deployment Tracker application on Red Hat Enterprise Linux (RHEL) with Fabio as a reverse proxy, using an external PostgreSQL service.

## System Requirements

- RHEL 8 or newer
- Fabio reverse proxy (already installed and configured)
- Access to an external PostgreSQL service (version 14 or newer)
- Node.js 16.x or newer
- At least 2GB RAM and 10GB disk space

## Deployment Architecture

The Deployment Tracker application consists of:
- React frontend (normally runs on port 3000 in development)
- Node.js backend API (normally runs on port 5001 in development)
- External PostgreSQL database service

For production deployment with Fabio, we'll configure the application to run on a single port (8080) with the following architecture:

```
Internet -> Fabio (port 8443) -> Deployment Tracker (single port 8080) -> External PostgreSQL
```

The production server will:
1. Serve the React frontend static files
2. Handle API requests through the same port
3. Connect to the external PostgreSQL service
4. Use a catchall handler to support client-side routing

## Prerequisites

Before deployment, ensure you have the following information about your external PostgreSQL service:
- Host address
- Port (usually 5432)
- Database name
- Username
- Password
- Ensure the database user has appropriate permissions to create tables and indexes

## Automated Deployment

We've provided a deployment script specifically for RHEL with external PostgreSQL that automates the installation process. Follow these steps:

1. Copy the application files to your server
2. Make the deployment script executable:
   ```
   chmod +x deploy-rhel-external-postgres.sh
   ```
3. Run the deployment script as root:
   ```
   sudo ./deploy-rhel-external-postgres.sh
   ```
4. When prompted, enter your external PostgreSQL connection details

The script will:
- Install system dependencies using dnf
- Install Node.js dependencies
- Test the connection to your external PostgreSQL service
- Build the React frontend
- Configure the application to run on port 8080
- Configure firewalld if it's running
- Create a systemd service for automatic startup
- Configure Fabio to route traffic to the application

## Manual Deployment

If you prefer to deploy manually, follow these steps:

### 1. Install Dependencies

```bash
# Update package lists
sudo dnf update -y

# Install Node.js
sudo dnf module enable -y nodejs:16
sudo dnf install -y nodejs

# Install PostgreSQL client (for database initialization)
sudo dnf install -y postgresql
```

### 2. Configure Application

Create a `.env` file in the application root directory:

```
NODE_ENV=production
PORT=8080

# PostgreSQL Configuration
PGUSER=your_postgres_user
PGHOST=your_postgres_host
PGPASSWORD=your_postgres_password
PGDATABASE=your_postgres_database
PGPORT=5432

# JWT Secret
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRE=24h
```

### 3. Initialize Database Schema

You'll need to initialize the database schema on your external PostgreSQL service:

```bash
# Test connection to PostgreSQL
PGPASSWORD=your_postgres_password psql -h your_postgres_host -p 5432 -U your_postgres_user -d your_postgres_database -c "SELECT 1"

# Initialize database schema
cd /path/to/deployment-tracker
PGPASSWORD=your_postgres_password psql -h your_postgres_host -p 5432 -U your_postgres_user -d your_postgres_database -f server/config/database.sql
```

### 4. Build and Run the Application

```bash
# Install dependencies
npm run install-all

# Build the React frontend
npm run build

# Start the production server
npm run prod
```



### 6. Create Systemd Service

Create a file at `/etc/systemd/system/deployment-tracker.service`:

```
[Unit]
Description=Deployment Tracker Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/path/to/deployment-tracker
ExecStart=/usr/bin/node production-server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable deployment-tracker
sudo systemctl start deployment-tracker
```



## Verifying the Deployment

After deployment, you can verify that the application is running correctly:

1. Check the application status:
   ```
   sudo systemctl status deployment-tracker
   ```

2. Check the application logs:
   ```
   sudo journalctl -u deployment-tracker
   ```

3. Access the application through your domain (configured in Fabio)

## Default Credentials

The application is initialized with the following admin user:
- Email: admin@example.com
- Password: admin123

**Important:** Change these credentials after the first login for security reasons.

## Troubleshooting

### Application Not Starting

Check the logs for errors:
```
sudo journalctl -u deployment-tracker -n 100
```

### Database Connection Issues

Verify you can connect to the external PostgreSQL service:
```
PGPASSWORD=your_postgres_password psql -h your_postgres_host -p 5432 -U your_postgres_user -d your_postgres_database -c "SELECT 1"
```

Common issues:
- Network connectivity problems between the application server and PostgreSQL
- Incorrect credentials in the .env file
- PostgreSQL service not allowing remote connections
- Firewall blocking PostgreSQL connections

### Firewall Issues

Check if firewalld is blocking the connection:
```
sudo firewall-cmd --list-all
```

### SELinux Issues

If you encounter permission issues, SELinux might be blocking access. Check the SELinux status:
```
sestatus
```

If SELinux is enforcing, you might need to create a custom policy or set the appropriate context:
```
sudo semanage port -a -t http_port_t -p tcp 8443
```

### Fabio Routing Issues

Verify Fabio configuration:
```
sudo cat /etc/fabio/fabio.properties
```

Check Fabio logs:
```
sudo journalctl -u fabio
```

## Backup and Restore

Since you're using an external PostgreSQL service, backup and restore procedures should be coordinated with your database administrator. However, you can still perform basic operations:

### Database Backup

```bash
PGPASSWORD=your_postgres_password pg_dump -h your_postgres_host -U your_postgres_user -d your_postgres_database > backup.sql
```

### Database Restore

```bash
PGPASSWORD=your_postgres_password psql -h your_postgres_host -U your_postgres_user -d your_postgres_database < backup.sql
```

## Updating the Application

To update the application:

1. Stop the service:
   ```
   sudo systemctl stop deployment-tracker
   ```

2. Replace the application files

3. Rebuild and restart:
   ```
   cd /path/to/deployment-tracker
   npm run install-all
   npm run build
   sudo systemctl start deployment-tracker
   ```

## Security Considerations

- Change the default admin credentials immediately
- Use a strong JWT secret in the .env file
- Consider setting up HTTPS with Fabio
- Regularly update the application and dependencies
- Ensure your PostgreSQL connection uses SSL if possible
- Consider using a .pgpass file instead of environment variables for PostgreSQL credentials
- Review SELinux policies to ensure proper security
