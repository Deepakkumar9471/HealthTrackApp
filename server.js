/**
 * Health Tracker App Server
 * This server provides the API endpoints for the Health Tracker application
 * and serves the static frontend files.
 */
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import database and storage
const { db, pool } = require('./src/server/db');
const storage = require('./src/server/storage');

// Import routes
const healthRoutes = require('./src/server/routes/health.js');
const activitiesRoutes = require('./src/server/routes/activities.js');
const goalsRoutes = require('./src/server/routes/goals.js');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/api/health', healthRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/goals', goalsRoutes);

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, 'src/frontend')));

// Serve the main index.html for any other routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Initialize the database and then start the server
(async () => {
  try {
    console.log('Initializing database...');
    await storage.initialize();
    console.log('Database initialized successfully');
    
    // Start the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize the database:', error);
    process.exit(1);
  }
})();