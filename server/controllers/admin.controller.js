/**
 * ============================================
 * Admin Controller
 * ============================================
 * Handles admin-only operations:
 *   - View all users
 *   - View all analyses
 *   - Get dashboard statistics
 *   - Update user roles
 *   - Delete users
 *
 * All endpoints require admin role verification
 * (handled by the isAdmin middleware in the routes).
 * ============================================
 */

const UserModel = require('../models/user.model');
const ResumeModel = require('../models/resume.model');

/**
 * GET /api/admin/users
 *
 * Get all registered users with their resume counts.
 * Sorted by most recently created first.
 */
const getAllUsers = async (req, res) => {
  try {
    const pool = req.app.get('db');
    const users = await UserModel.findAll(pool);

    return res.status(200).json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error('getAllUsers error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users.',
    });
  }
};

/**
 * GET /api/admin/analyses
 *
 * Get all resume analyses across all users.
 * Includes user info for each analysis.
 */
const getAllAnalyses = async (req, res) => {
  try {
    const pool = req.app.get('db');
    const analyses = await ResumeModel.findAll(pool);

    return res.status(200).json({
      success: true,
      data: analyses,
      count: analyses.length,
    });
  } catch (error) {
    console.error('getAllAnalyses error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve analyses.',
    });
  }
};

/**
 * GET /api/admin/stats
 *
 * Get aggregate dashboard statistics including:
 * - User stats (total, by role, recent signups)
 * - Resume stats (total, avg ATS score, score distribution)
 */
const getDashboardStats = async (req, res) => {
  try {
    const pool = req.app.get('db');

    // Gather stats from both models in parallel for speed
    const [userStats, resumeStats] = await Promise.all([
      UserModel.getStats(pool),
      ResumeModel.getStats(pool),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users: userStats,
        resumes: resumeStats,
      },
    });
  } catch (error) {
    console.error('getDashboardStats error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics.',
    });
  }
};

/**
 * PATCH /api/admin/users/:id/role
 *
 * Update a user's role (e.g., promote to admin or demote to user).
 * Expects { role: "admin" | "user" } in the request body.
 *
 * Safety: Prevents admins from changing their own role.
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const pool = req.app.get('db');

    // Validate the role value
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "user" or "admin".',
      });
    }

    // Prevent admins from changing their own role (to avoid lockout)
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role.',
      });
    }

    // Verify the target user exists
    const user = await UserModel.findById(pool, parseInt(id));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Update the role
    const updated = await UserModel.updateRole(pool, parseInt(id), role);

    if (!updated) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update user role.',
      });
    }

    // Fetch the updated user record
    const updatedUser = await UserModel.findById(pool, parseInt(id));

    return res.status(200).json({
      success: true,
      message: `User role updated to "${role}" successfully.`,
      data: updatedUser,
    });
  } catch (error) {
    console.error('updateUserRole error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user role.',
    });
  }
};

/**
 * DELETE /api/admin/users/:id
 *
 * Delete a user and all their associated data.
 * Cascading deletes handle resumes, suggestions, etc.
 *
 * Safety: Prevents admins from deleting themselves.
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.get('db');

    // Prevent self-deletion
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account from the admin panel.',
      });
    }

    // Verify the target user exists
    const user = await UserModel.findById(pool, parseInt(id));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Delete the user (cascading deletes handle related records)
    const deleted = await UserModel.deleteUser(pool, parseInt(id));

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `User "${user.name}" has been deleted successfully.`,
    });
  } catch (error) {
    console.error('deleteUser error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user.',
    });
  }
};

module.exports = {
  getAllUsers,
  getAllAnalyses,
  getDashboardStats,
  updateUserRole,
  deleteUser,
};
