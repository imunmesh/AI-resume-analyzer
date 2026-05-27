/**
 * ============================================
 * Resume Routes
 * ============================================
 * All routes are protected (require authentication).
 *
 * POST   /api/resumes/upload      - Upload a resume file
 * POST   /api/resumes/:id/analyze - Run AI analysis
 * POST   /api/resumes/:id/match   - Match against a job description
 * GET    /api/resumes             - Get user's resume history
 * GET    /api/resumes/:id         - Get a specific resume with full data
 * DELETE /api/resumes/:id         - Delete a resume
 * ============================================
 */

const express = require('express');
const router = express.Router();
const { verifyAuth } = require('../middleware/auth.middleware');
const { uploadResume } = require('../middleware/upload.middleware');
const {
  upload,
  analyze,
  matchJob,
  getHistory,
  getById,
  deleteResume,
  downloadResume,
} = require('../controllers/resume.controller');

// All resume routes require authentication
router.use(verifyAuth);

// Upload a resume file (PDF or DOCX, max 5MB)
// The uploadResume middleware handles file parsing via multer
router.post('/upload', uploadResume, upload);

// Run AI analysis on an uploaded resume (can take id in params or resumeId in body)
router.post('/analyze', analyze);
router.post('/:id/analyze', analyze);

// Match a resume against a job description
router.post('/match-job', matchJob);
router.post('/:id/match', matchJob);

// Get the authenticated user's resume history (summary list)
router.get('/history', getHistory);
router.get('/', getHistory);

// Download a specific resume's text
router.get('/:id/download', downloadResume);

// Get a specific resume with all related data
router.get('/:id', getById);

// Delete a specific resume and all associated data
router.delete('/:id', deleteResume);

module.exports = router;
