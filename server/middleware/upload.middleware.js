/**
 * ============================================
 * File Upload Middleware (Multer)
 * ============================================
 * Configures Multer for handling resume file uploads.
 * - Accepts only PDF and DOCX files
 * - Maximum file size: 5 MB
 * - Stores files in memory (buffer) for processing
 * ============================================
 */

const multer = require('multer');
const path = require('path');

// ------------------------------------
// Allowed file types for resume uploads
// ------------------------------------
const ALLOWED_MIME_TYPES = [
  'application/pdf',                                                       // .pdf
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

// ------------------------------------
// Storage configuration: memory storage
// We keep files in memory as Buffers so we can
// pass them directly to pdf-parse / mammoth
// without writing to disk.
// ------------------------------------
const storage = multer.memoryStorage();

// ------------------------------------
// File filter: validates mime type and extension
// ------------------------------------
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ALLOWED_MIME_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true); // Accept the file
  } else {
    cb(
      new multer.MulterError(
        'LIMIT_UNEXPECTED_FILE',
        `Invalid file type. Only PDF and DOCX files are allowed. Received: ${file.mimetype}`
      ),
      false
    );
  }
};

// ------------------------------------
// Multer instance with all config
// ------------------------------------
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max file size
    files: 1,                   // Only 1 file per request
  },
});

/**
 * Middleware for handling single resume file upload.
 * The field name expected in the form-data is 'resume'.
 * Wraps multer's error handling to return clean JSON errors.
 */
const uploadResume = (req, res, next) => {
  const singleUpload = upload.single('resume');

  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors (file too large, wrong field, etc.)
      let message = 'File upload error.';

      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          message = 'File is too large. Maximum size is 10 MB.';
          break;
        case 'LIMIT_FILE_COUNT':
          message = 'Too many files. Please upload only one resume.';
          break;
        case 'LIMIT_UNEXPECTED_FILE':
          message = err.message || 'Invalid file type. Only PDF and DOCX files are allowed.';
          break;
        default:
          message = err.message;
      }

      return res.status(400).json({
        success: false,
        message,
      });
    } else if (err) {
      // General / unknown errors
      return res.status(500).json({
        success: false,
        message: 'An unexpected error occurred during file upload.',
      });
    }

    // No error — proceed to the next middleware/controller
    next();
  });
};

module.exports = { uploadResume };
