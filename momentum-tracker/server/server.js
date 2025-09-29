const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const stockRoutes = require('./routes/stocks');
const Database = require('./db/database');
const { handleError, handleNotFound } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
const db = new Database();

// Make db available globally for routes
global.db = db;

// Initialize database asynchronously
(async () => {
  try {
    await db.init();
    console.log('Database initialization completed');
    
    // Start server after database is initialized
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });

    // Keep the process alive
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        db.close();
      });
    });

    process.on('SIGINT', () => {
      console.log('\nSIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        db.close();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
})();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stocks', stockRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });
}

// Error handling middleware
app.use(handleError);

// 404 handler
app.use('*', handleNotFound);

module.exports = app;