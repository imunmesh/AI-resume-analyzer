/**
 * ============================================
 * User Model
 * ============================================
 * Handles all database operations for the users table.
 * All methods accept a connection pool as the first argument
 * so they can be used from any context.
 * ============================================
 */

const UserModel = {
  /**
   * Find a user by their Firebase UID.
   * Used during auth to look up existing users.
   * @param {object} pool - MySQL connection pool
   * @param {string} firebaseUid - Firebase UID
   * @returns {object|null} User record or null
   */
  findByFirebaseUid: async (pool, firebaseUid) => {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE firebase_uid = ?',
      [firebaseUid]
    );
    return rows[0] || null;
  },

  /**
   * Find a user by their email address.
   * @param {object} pool - MySQL connection pool
   * @param {string} email - Email address
   * @returns {object|null} User record or null
   */
  findByEmail: async (pool, email) => {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  /**
   * Find a user by their MySQL auto-increment ID.
   * @param {object} pool - MySQL connection pool
   * @param {number} id - User ID
   * @returns {object|null} User record or null
   */
  findById: async (pool, id) => {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create a new user record in the database.
   * Called when a Firebase-authenticated user logs in for the first time.
   * @param {object} pool - MySQL connection pool
   * @param {object} userData - { firebase_uid, name, email }
   * @returns {number} The new user's ID
   */
  create: async (pool, userData) => {
    const { firebase_uid, name, email } = userData;
    const [result] = await pool.query(
      'INSERT INTO users (firebase_uid, name, email) VALUES (?, ?, ?)',
      [firebase_uid, name, email]
    );
    return result.insertId;
  },

  /**
   * Get all users (admin feature).
   * Ordered by most recently created first.
   * Includes a count of how many resumes each user has uploaded.
   * @param {object} pool - MySQL connection pool
   * @returns {Array} Array of user records
   */
  findAll: async (pool) => {
    const [rows] = await pool.query(
      `SELECT u.*, COUNT(r.id) AS resume_count
       FROM users u
       LEFT JOIN resumes r ON u.id = r.user_id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    return rows;
  },

  /**
   * Update a user's role (admin feature).
   * @param {object} pool - MySQL connection pool
   * @param {number} userId - User ID to update
   * @param {string} role - New role ('user' or 'admin')
   * @returns {boolean} True if the update was successful
   */
  updateRole: async (pool, userId, role) => {
    const [result] = await pool.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    );
    return result.affectedRows > 0;
  },

  /**
   * Delete a user by ID (admin feature).
   * Cascading deletes will also remove their resumes, suggestions, etc.
   * @param {object} pool - MySQL connection pool
   * @param {number} userId - User ID to delete
   * @returns {boolean} True if the deletion was successful
   */
  deleteUser: async (pool, userId) => {
    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  },

  /**
   * Get aggregate stats about users (admin dashboard).
   * @param {object} pool - MySQL connection pool
   * @returns {object} { totalUsers, adminCount, userCount, recentUsers }
   */
  getStats: async (pool) => {
    // Total user count
    const [[{ totalUsers }]] = await pool.query(
      'SELECT COUNT(*) AS totalUsers FROM users'
    );

    // Count by role
    const [roleCounts] = await pool.query(
      'SELECT role, COUNT(*) AS count FROM users GROUP BY role'
    );

    const adminCount = roleCounts.find(r => r.role === 'admin')?.count || 0;
    const userCount = roleCounts.find(r => r.role === 'user')?.count || 0;

    // Users who signed up in the last 7 days
    const [[{ recentUsers }]] = await pool.query(
      'SELECT COUNT(*) AS recentUsers FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
    );

    return { totalUsers, adminCount, userCount, recentUsers };
  },
};

module.exports = UserModel;
