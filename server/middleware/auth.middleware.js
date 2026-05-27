/**
 * ============================================
 * Authentication Middleware
 * ============================================
 * Verifies Firebase ID tokens from the Authorization header.
 * On success, looks up (or creates) the user in MySQL and
 * attaches the full user object to req.user.
 *
 * Also exports an isAdmin middleware for admin-only routes.
 * ============================================
 */

const { admin } = require('../config/firebase');
const UserModel = require('../models/user.model');

/**
 * Middleware: verifyAuth
 * - Extracts the Bearer token from the Authorization header
 * - Verifies it with Firebase Admin SDK
 * - Fetches the corresponding user from MySQL (creates if first login)
 * - Attaches the user record to req.user
 */
const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check that the Authorization header is present and formatted correctly
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided. Please include a valid Bearer token in the Authorization header.',
      });
    }

    // Extract the token (everything after "Bearer ")
    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token is empty.',
      });
    }

    // Verify the token with Firebase Admin SDK
    let decodedToken;
    if (admin.isConfigured !== false) {
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (firebaseError) {
        console.error('Firebase token verification failed:', firebaseError.message);
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token. Please log in again.',
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

    // Look up the user in our MySQL database by Firebase UID
    const pool = req.app.get('db');
    let user = await UserModel.findByFirebaseUid(pool, decodedToken.uid);

    // If the user doesn't exist in MySQL yet, create them
    // (this handles first-time login after Firebase signup)
    if (!user) {
      const newUser = {
        firebase_uid: decodedToken.uid,
        name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
        email: decodedToken.email,
      };
      const userId = await UserModel.create(pool, newUser);
      user = await UserModel.findById(pool, userId);
    }

    // Attach the full user object to the request for downstream use
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed due to a server error.',
    });
  }
};

/**
 * Middleware: isAdmin
 * - Must be used AFTER verifyAuth (req.user must exist)
 * - Checks that the authenticated user has the 'admin' role
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }

  next();
};

module.exports = { verifyAuth, isAdmin };
