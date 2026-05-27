/**
 * ============================================
 * Parser Service
 * ============================================
 * Extracts plain text from uploaded resume files.
 * Supports:
 *   - PDF files (via pdf-parse)
 *   - DOCX files (via mammoth)
 * ============================================
 */

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');

/**
 * Extract text from a PDF buffer.
 * @param {Buffer} buffer - The raw PDF file buffer
 * @returns {string} Extracted plain text
 */
const extractFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);

    // pdf-parse returns the full text content in data.text
    const text = data.text;

    if (!text || text.trim().length === 0) {
      throw new Error('The PDF appears to be empty or contains only images. Please upload a text-based PDF.');
    }

    return text.trim();
  } catch (error) {
    // Re-throw with a more user-friendly message if it's a parsing error
    if (error.message.includes('empty') || error.message.includes('images')) {
      throw error;
    }
    throw new Error(`Failed to parse PDF file: ${error.message}`);
  }
};

/**
 * Extract text from a DOCX buffer.
 * Uses mammoth to convert DOCX to plain text (not HTML)
 * for cleaner AI analysis.
 * @param {Buffer} buffer - The raw DOCX file buffer
 * @returns {string} Extracted plain text
 */
const extractFromDOCX = async (buffer) => {
  try {
    // mammoth.extractRawText gives us plain text without HTML formatting
    const result = await mammoth.extractRawText({ buffer });

    const text = result.value;

    if (!text || text.trim().length === 0) {
      throw new Error('The DOCX file appears to be empty. Please upload a resume with content.');
    }

    // Log any warnings from mammoth (e.g., unsupported features)
    if (result.messages && result.messages.length > 0) {
      console.warn('Mammoth warnings:', result.messages);
    }

    return text.trim();
  } catch (error) {
    if (error.message.includes('empty')) {
      throw error;
    }
    throw new Error(`Failed to parse DOCX file: ${error.message}`);
  }
};

/**
 * Main entry point: extract text from a resume file.
 * Automatically detects the file type by extension and
 * delegates to the appropriate parser.
 * @param {Buffer} buffer - The raw file buffer
 * @param {string} fileName - Original file name (used to detect type)
 * @returns {string} Extracted plain text
 */
const extractText = async (buffer, fileName) => {
  const ext = path.extname(fileName).toLowerCase();

  switch (ext) {
    case '.pdf':
      return await extractFromPDF(buffer);

    case '.docx':
      return await extractFromDOCX(buffer);

    default:
      throw new Error(`Unsupported file type: ${ext}. Only PDF and DOCX files are accepted.`);
  }
};

module.exports = { extractText, extractFromPDF, extractFromDOCX };
