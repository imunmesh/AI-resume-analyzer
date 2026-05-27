/**
 * ============================================
 * Admin Routes
 * ============================================
 * All routes require authentication AND admin role.
 *
 * GET    /api/admin/stats          - Dashboard statistics
 * GET    /api/admin/users          - List all users
 * GET    /api/admin/analyses       - List all analyses
 * PATCH  /api/admin/users/:id/role - Update a user's role
 * DELETE /api/admin/users/:id      - Delete a user
 * ============================================
 */

const express = require('express');
const router = express.Router();
const { verifyAuth, isAdmin } = require('../middleware/auth.middleware');
const {
  getAllUsers,
  getAllAnalyses,
  getDashboardStats,
  updateUserRole,
  deleteUser,
} = require('../controllers/admin.controller');

// All admin routes require authentication + admin role
router.use(verifyAuth);
router.use(isAdmin);

// Get aggregate dashboard statistics (users + resumes)
router.get('/stats', getDashboardStats);

// Get all registered users with resume counts
router.get('/users', getAllUsers);

// Get all resume analyses across all users
router.get('/analyses', getAllAnalyses);

// Update a specific user's role (promote/demote)
router.patch('/users/:id/role', updateUserRole);

// Delete a user and all their associated data
router.delete('/users/:id', deleteUser);

module.exports = router;
