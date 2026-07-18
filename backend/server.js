'use strict';
const express = require('express');
const cors = require('cors');
const pool = require('./config/database');

const app = express();

// ========== MIDDLEWARE ==========
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS — allow all Replit preview domains + configured frontend
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, etc.)
    if (!origin) return callback(null, true);
    // Allow any Replit domain and configured frontend
    const allowed = [
      /\.replit\.dev$/,
      /\.repl\.co$/,
      /localhost/,
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    const ok = allowed.some(p => (p instanceof RegExp ? p.test(origin) : origin.startsWith(p)));
    callback(null, ok ? true : new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ========== HEALTH CHECK ==========
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime(), db: 'connected' });
  } catch {
    res.status(503).json({ status: 'degraded', db: 'disconnected' });
  }
});

// ========== API ROUTES ==========
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/content',   require('./routes/content'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/affiliate', require('./routes/affiliate'));
app.use('/api/products',  require('./routes/products'));
app.use('/api/platforms', require('./routes/platforms'));
app.use('/api/settings',  require('./routes/settings'));

// ========== 404 HANDLER ==========
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found', path: req.path });
});

// ========== GLOBAL ERROR HANDLER ==========
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString(),
  });
});

// ========== DATABASE PROBE ==========
pool.query('SELECT NOW()', (err, result) => {
  if (err) console.error('❌ Database connection failed:', err.message);
  else console.log('✅ Database connected:', result.rows[0].now);
});

// ========== CRON JOBS ==========
require('./jobs/dailyPostingJob');
require('./jobs/metricsSyncJob');
require('./jobs/conversionTrackingJob');
require('./jobs/recommendationEngineJob');

// ========== START SERVER ==========
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Income Autopilot API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ========== GRACEFUL SHUTDOWN ==========
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully…');
  server.close(() => {
    pool.end(() => { console.log('Pool closed.'); process.exit(0); });
  });
});

module.exports = app;
