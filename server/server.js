/**
 * ============================================
 * Resume Analyzer — Server Entry Point
 * ============================================
 * Main application file that:
 *   1. Loads environment configuration
 *   2. Initializes Firebase Admin SDK
 *   3. Connects to MySQL and auto-creates DB/tables
 *   4. Sets up Express middleware (CORS, JSON parsing)
 *   5. Mounts all route modules
 *   6. Starts the HTTP server
 * ============================================
 */

// Load environment variables FIRST (before any other imports use them)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./config/db');
const { initializeFirebase } = require('./config/firebase');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

// Import route modules
const authRoutes = require('./routes/auth.routes');
const resumeRoutes = require('./routes/resume.routes');
const adminRoutes = require('./routes/admin.routes');

// ------------------------------------
// Create Express application
// ------------------------------------
const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------------------
// CORS Configuration
// Allow requests from the frontend dev server
// ------------------------------------
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ------------------------------------
// Body Parsing Middleware
// ------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ------------------------------------
// Health Check Endpoint
// Useful for monitoring and load balancers
// ------------------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Resume Analyzer API is running.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ------------------------------------
// Mount API Routes
// ------------------------------------
app.use('/api/auth', authRoutes);       // Authentication & user sync
app.use('/api/resume', resumeRoutes);   // Resume CRUD & AI analysis (client matches this)
app.use('/api/resumes', resumeRoutes);  // Compatibility alias
app.use('/api/admin', adminRoutes);     // Admin panel operations

// ------------------------------------
// Error Handling (must be after routes)
// ------------------------------------
app.use(notFoundHandler);  // Catch 404s for undefined routes
app.use(errorHandler);     // Catch all unhandled errors

// ------------------------------------
// Start the server
// ------------------------------------
const startServer = async () => {
  try {
    // Step 1: Initialize Firebase Admin SDK
    initializeFirebase();

    // Step 2: Initialize the database (create DB & tables if needed)
    console.log('🔌 Connecting to MySQL...');
    const pool = await initializeDatabase();

    // Make the database pool available to all routes via app.get('db')
    app.set('db', pool);

    // Step 3: Start listening for HTTP requests
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 ==========================================');
      console.log(`🚀  Resume Analyzer API Server`);
      console.log(`🚀  Running on: http://localhost:${PORT}`);
      console.log(`🚀  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🚀  Health check: http://localhost:${PORT}/api/health`);
      console.log('🚀 ==========================================');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections globally
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions globally
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

// Launch!
startServer();
