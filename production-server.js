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
    console.log(`Server running in`);
    });