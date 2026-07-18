'use strict';

// Attach to an express router as a 4-arg handler
const errorHandler = (err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  console.error(`[errorHandler] ${status} — ${err.message}`);
  res.status(status).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorHandler;
