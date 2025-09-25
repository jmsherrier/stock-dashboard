// Error handling middleware for Express
const handleError = (err, req, res, next) => {
  console.error('Error:', err);
  
  // API validation errors (from Joi)
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details.map(detail => detail.message)
    });
  }
  
  // Database errors
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({
      error: 'Data conflict - this resource may already exist'
    });
  }
  
  // Authentication errors
  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
};

// 404 handler
const handleNotFound = (req, res) => {
  res.status(404).json({ 
    error: `Route not found: ${req.method} ${req.path}` 
  });
};

module.exports = {
  handleError,
  handleNotFound
};