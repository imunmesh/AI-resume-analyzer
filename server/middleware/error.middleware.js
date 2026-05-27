/**
 * ============================================
 * Global Error Handling Middleware
 * ============================================
 * Catches any unhandled errors thrown in routes
 * or other middleware and returns a consistent
 * JSON error response.
 * ============================================
 */

/**
 * 404 Not Found handler.
 * Placed after all route definitions to catch
 * requests to undefined endpoints.
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Global error handler.
 * Express recognizes this as an error-handling middleware
 * because it has 4 parameters (err, req, res, next).
 */
const errorHandler = (err, req, res, next) => {
  // Log the full error in development for debugging
  console.error('❌ Unhandled Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  // Determine the appropriate status code
  const statusCode = err.statusCode || err.status || 500;

  // Build the response
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = { notFoundHandler, errorHandler };
