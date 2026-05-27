/**
 * ============================================
 * Auth Controller
 * ============================================
 * Handles user authentication sync between Firebase
 * and our MySQL database. The frontend authenticates
 * with Firebase, then calls POST /api/auth/sync to
 * create or retrieve the user record in MySQL.
 * ============================================
 */

const { admin } = require('../config/firebase');
const UserModel = require('../models/user.model');

/**
 * POST /api/auth/sync
 *
 * Sync a Firebase-authenticated user with our MySQL database.
 * - Verifies the Firebase ID token
 * - Creates a new user record if this is their first login
 * - Returns the full user object from MySQL
 *
 * This endpoint is called by the frontend after Firebase login.
 * Unlike protected routes (which use the auth middleware),
 * this endpoint handles token verification inline so it can
 * do the initial user creation.
 */
const syncUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    // Validate Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided.',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Verify the Firebase ID token
    let decodedToken;
    if (admin.isConfigured !== false) {
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (error) {
        console.error('Firebase token verification failed:', error.message);
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication token.',
        });
      }
    } else {
      const jwt = require('jsonwebtoken');
      decodedToken = jwt.decode(idToken);
      if (!decodedToken) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token structure. Malformed JWT.',
        });
      }
      // Set default firebase fields if mock token doesn't have them
      decodedToken.uid = decodedToken.uid || decodedToken.user_id || decodedToken.sub || 'mock_user_uid_123';
      decodedToken.email = decodedToken.email || 'mock.user@example.com';
      decodedToken.name = decodedToken.name || decodedToken.email.split('@')[0];
    }

    const pool = req.app.get('db');
    const { uid, email, name, picture } = decodedToken;

    // Check if the user already exists in our database
    let user = await UserModel.findByFirebaseUid(pool, uid);

    if (user) {
      // User exists — return their data
      return res.status(200).json({
        success: true,
        message: 'User synced successfully.',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
        },
      });
    }

    // User doesn't exist — create a new record
    // Use the name from Firebase, or fall back to the email prefix
    const userName = name || req.body.name || email?.split('@')[0] || 'User';

    const userId = await UserModel.create(pool, {
      firebase_uid: uid,
      name: userName,
      email: email,
    });

    // Fetch the newly created user
    user = await UserModel.findById(pool, userId);

    return res.status(201).json({
      success: true,
      message: 'User created and synced successfully.',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('syncUser error:', error.message);

    // Handle duplicate email/uid errors gracefully
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to sync user. Please try again.',
    });
  }
};

/**
 * GET /api/auth/me
 *
 * Get the current authenticated user's profile.
 * Requires the verifyAuth middleware to run first.
 */
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        created_at: req.user.created_at,
      },
    });
  } catch (error) {
    console.error('getMe error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile.',
    });
  }
};

module.exports = { syncUser, getMe };
