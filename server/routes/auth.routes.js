/**
 * ============================================
 * Auth Routes
 * ============================================
 * POST /api/auth/sync  - Sync Firebase user with MySQL
 * GET  /api/auth/me    - Get current user profile (protected)
 * ============================================
 */

const express = require('express');
const router = express.Router();
const { syncUser, getMe } = require('../controllers/auth.controller');
const { verifyAuth } = require('../middleware/auth.middleware');

// Sync Firebase user with MySQL database
// Called by the frontend after Firebase authentication
router.post('/sync', syncUser);

// Get current authenticated user's profile
// Protected — requires a valid Firebase token
router.get('/me', verifyAuth, getMe);

module.exports = router;
