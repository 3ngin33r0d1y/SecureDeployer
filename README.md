# Deployment Tracking Application

A professional deployment tracking application with React frontend and Node.js backend using PostgreSQL.

## Features

- **Admin Dashboard**: Manage users, services, and deployments
- **User Dashboard**: View services and deployments
- **Authentication**: JWT-based authentication with role-based access control
- **File Upload**: Support for documentation files (PDF, Excel, PowerPoint, Word) up to 200MB

## Tech Stack

- **Frontend**: React, React Router, React Bootstrap
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Authentication**: JWT, bcrypt
- **Styling**: Custom CSS with Société Générale-inspired black and red color scheme

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Update the `.env` file with your PostgreSQL credentials:
   ```
   PGUSER=your_db_user
   PGHOST=your_db_host
   PGPASSWORD=your_db_password
   PGDATABASE=deployment_tracker
   PGPORT=5432
   JWT_SECRET=your_jwt_secret_key
   ```
4. Initialize the database:
   ```
   ./init-db.sh
   ```
5. Start the application:
   ```
   npm run dev
   ```

## Usage

### Default Admin Credentials
- Email: admin@example.com
- Password: admin123

### Admin Features
- Create, view, and delete users
- Create, view, and delete services
- Create, view, and delete deployments
- Upload documentation files for deployments

### User Features
- View services and their descriptions
- View deployment history
- Download deployment documentation

## Development

- Run backend only: `npm run server`
- Run frontend only: `npm run client`
- Run both concurrently: `npm run dev`

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Role-based middleware for access control
- CORS enabled for API access
