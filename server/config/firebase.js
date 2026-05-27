/**
 * ============================================
 * Firebase Admin SDK Configuration
 * ============================================
 * Initializes the Firebase Admin SDK for server-side
 * token verification. Uses service account credentials
 * provided via environment variables.
 * ============================================
 */

const admin = require('firebase-admin');

/**
 * Initialize Firebase Admin SDK.
 * Reads credentials from environment variables so we don't
 * need a service account JSON file in the repo.
 */
const initializeFirebase = () => {
  // Avoid re-initializing if already done (e.g. in tests)
  if (admin.apps.length > 0) {
    return admin;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // The private key comes as an escaped string from .env;
  // we need to replace the literal '\n' with actual newlines.
  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  const hasValidCredentials =
    projectId && projectId !== 'your_firebase_project_id' &&
    clientEmail && clientEmail !== 'your_firebase_client_email' &&
    privateKey && privateKey.startsWith('-----BEGIN PRIVATE KEY-----');

  // Validate that all required Firebase config is present
  if (!hasValidCredentials) {
    console.warn(
      '\n⚠️  ======================================================\n' +
      '⚠️  Firebase service account credentials are not fully configured.\n' +
      '⚠️  Server will run in DEVELOPMENT MOCK AUTH mode.\n' +
      '⚠️  To enable real token validation, please configure:\n' +
      '⚠️  FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in server/.env\n' +
      '⚠️  ======================================================\n'
    );

    // Initialize without credentials (limited functionality)
    admin.initializeApp({
      projectId: projectId || 'resume-analyzer-58678',
    });
    admin.isConfigured = false;
  } else {
    // Initialize with full service account credentials
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    admin.isConfigured = true;
    console.log('✅ Firebase Admin SDK initialized successfully.');
  }

  return admin;
};

module.exports = { initializeFirebase, admin };
