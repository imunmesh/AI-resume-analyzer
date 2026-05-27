/**
 * ============================================
 * Database Configuration & Connection Pool
 * ============================================
 * Sets up a MySQL connection pool using mysql2/promise.
 * Automatically creates the database and all required
 * tables on first startup.
 * ============================================
 */

const mysql = require('mysql2/promise');

// ------------------------------------
// Create a connection pool WITHOUT a specific database
// (used only for initial DB creation)
// ------------------------------------
const createInitialPool = () => {
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
  });
};

// ------------------------------------
// Create the main connection pool WITH the database selected
// (used throughout the app for all queries)
// ------------------------------------
const createPool = () => {
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'resume_analyzer',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Enable named placeholders for cleaner queries
    namedPlaceholders: true,
  });
};

// ------------------------------------
// SQL statements for table creation
// ------------------------------------
const CREATE_TABLES_SQL = [
  // Users table — stores Firebase-synced user info
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_firebase_uid (firebase_uid),
    INDEX idx_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Resumes table — uploaded files and analysis results
  `CREATE TABLE IF NOT EXISTS resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    resume_text LONGTEXT,
    file_size INT DEFAULT 0,
    ats_score INT DEFAULT NULL,
    analysis_data JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Suggestions table — AI-generated improvement suggestions
  `CREATE TABLE IF NOT EXISTS suggestions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    suggestion TEXT NOT NULL,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    INDEX idx_resume_id (resume_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Missing skills table — skills the AI flagged as absent
  `CREATE TABLE IF NOT EXISTS missing_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    skill VARCHAR(100) NOT NULL,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    INDEX idx_resume_id (resume_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Job matches table — resume vs job description comparisons
  `CREATE TABLE IF NOT EXISTS job_matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    job_description TEXT,
    match_percentage INT DEFAULT NULL,
    missing_keywords TEXT,
    improvements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    INDEX idx_resume_id (resume_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

// ------------------------------------
// Initialize database and tables
// ------------------------------------
const initializeDatabase = async () => {
  const dbName = process.env.DB_NAME || 'resume_analyzer';
  let initPool;

  try {
    // Step 1: Connect without a database and create it if needed
    initPool = createInitialPool();
    await initPool.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ Database "${dbName}" is ready.`);
    await initPool.end();

    // Step 2: Connect to the newly created database and create tables
    const pool = createPool();

    for (const sql of CREATE_TABLES_SQL) {
      await pool.query(sql);
    }
    console.log('✅ All tables are ready.');

    // Auto-migration: check if file_size column exists in resumes, if not, add it
    try {
      await pool.query('SELECT file_size FROM resumes LIMIT 1');
    } catch (err) {
      if (err.code === 'ER_BAD_FIELD_ERROR' || err.message.includes('Unknown column')) {
        console.log('Adding "file_size" column to resumes table...');
        await pool.query('ALTER TABLE resumes ADD COLUMN file_size INT DEFAULT 0');
        console.log('✅ Column "file_size" added successfully.');
      }
    }

    return pool;
  } catch (error) {
    // Clean up the initial pool if it's still open
    if (initPool) {
      try { await initPool.end(); } catch (_) { /* ignore */ }
    }
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

module.exports = { initializeDatabase, createPool };
