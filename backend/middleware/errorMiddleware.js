/**
 * Global Error Handling Middleware
 * Centralized error processing for consistent API error responses
 */

/**
 * 404 Not Found handler
 * Called when no route matches the request
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global Error Handler
 * Processes all errors thrown in the application
 * Provides structured error responses with appropriate status codes
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 if status code is still 200
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  let errors = null;

  // ==========================================
  // MONGOOSE SPECIFIC ERRORS
  // ==========================================

  // Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found. Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `Duplicate value: '${value}' already exists for field '${field}'. Please use a different value.`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message
    }));
  }

  // ==========================================
  // JWT ERRORS
  // ==========================================

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  }

  // ==========================================
  // EXPRESS VALIDATOR ERRORS
  // ==========================================
  if (err.type === 'validation') {
    statusCode = 422;
    message = 'Validation error';
    errors = err.errors;
  }

  // ==========================================
  // BUILD RESPONSE
  // ==========================================

  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    // Include stack trace only in development mode
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Log error to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`\n❌ ERROR [${statusCode}]: ${message}`);
    if (err.stack) console.error(err.stack);
  }

  res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };
