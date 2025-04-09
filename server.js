const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Test database connection
const pool = require('./server/config/db');
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection test failed:', err);
  } else {
    console.log('Database connection test successful:', res.rows[0]);
  }
});

// Test JWT token generation
const testToken = jwt.sign(
  { id: 1, email: 'test@example.com', role: 'admin' },
  process.env.JWT_SECRET || 'fallback_secret_key',
  { expiresIn: '24h' }
);
console.log('Test JWT token generated:', testToken);

// Routes
app.use('/api/auth', require('./server/routes/auth'));
app.use('/api/users', require('./server/routes/users'));
app.use('/api/services', require('./server/routes/services'));
app.use('/api/deployments', require('./server/routes/deployments'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Set port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
