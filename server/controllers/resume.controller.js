/**
 * ============================================
 * Resume Controller
 * ============================================
 * Handles all resume-related operations:
 *   - Upload and parse resume files
 *   - Trigger AI analysis
 *   - Match against job descriptions
 *   - Retrieve analysis history
 * ============================================
 */

const ResumeModel = require('../models/resume.model');
const { extractText } = require('../services/parser.service');
const { analyzeResume, matchJobDescription } = require('../services/gemini.service');

/**
 * POST /api/resumes/upload
 *
 * Upload a resume file (PDF or DOCX), extract the text,
 * and save it to the database. Does NOT run AI analysis
 * yet — that's a separate step so users can review the
 * extracted text first.
 */
const upload = async (req, res) => {
  try {
    // Validate that a file was actually uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a PDF or DOCX file.',
      });
    }

    const { buffer, originalname, size } = req.file;

    // Extract plain text from the uploaded file
    const resumeText = await extractText(buffer, originalname);

    // Validate that we got meaningful text
    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'The uploaded file does not contain enough text to analyze. Please upload a valid resume.',
      });
    }

    // Save the resume record to the database
    const pool = req.app.get('db');
    const resumeId = await ResumeModel.create(pool, {
      user_id: req.user.id,
      file_name: originalname,
      resume_text: resumeText,
      file_size: size || buffer.length || 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Resume uploaded and text extracted successfully.',
      data: {
        id: resumeId,
        file_name: originalname,
        text_length: resumeText.length,
        file_size: size || buffer.length || 0,
      },
    });
  } catch (error) {
    console.error('Upload error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload and parse the resume.',
    });
  }
};

/**
 * POST /api/resumes/:id/analyze
 *
 * Run AI analysis on a previously uploaded resume.
 * Calls the Gemini API, then saves the results
 * (ATS score, suggestions, missing skills, etc.)
 * back to the database.
 */
const analyze = async (req, res) => {
  try {
    const id = req.params.id || req.body.resumeId;
    const pool = req.app.get('db');

    // Validate that we have an ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Resume ID is required.',
      });
    }

    // Fetch the resume and verify ownership
    const resume = await ResumeModel.findById(pool, parseInt(id));

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.',
      });
    }

    // Ensure the user owns this resume (unless they're an admin)
    if (resume.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to analyze this resume.',
      });
    }

    // Check that the resume has extracted text
    if (!resume.resume_text || resume.resume_text.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'This resume does not contain enough text for analysis.',
      });
    }

    // Run AI analysis
    const analysisResult = await analyzeResume(resume.resume_text);

    // Save the analysis results to the database
    await ResumeModel.updateAnalysis(pool, resume.id, {
      ats_score: analysisResult.atsScore,
      analysis_data: analysisResult,
    });

    // Save suggestions as individual records
    await ResumeModel.saveSuggestions(pool, resume.id, analysisResult.suggestions);

    // Save missing skills as individual records
    await ResumeModel.saveMissingSkills(pool, resume.id, analysisResult.missingSkills);

    // Fetch the updated resume with all related data
    const updatedResume = await ResumeModel.findById(pool, resume.id);

    return res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully.',
      data: updatedResume,
    });
  } catch (error) {
    console.error('Analyze error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze the resume. Please try again.',
    });
  }
};

/**
 * POST /api/resumes/:id/match
 *
 * Match a resume against a provided job description.
 * Expects { jobDescription: "..." } in the request body.
 */
const matchJob = async (req, res) => {
  try {
    const id = req.params.id || req.body.resumeId;
    const { jobDescription } = req.body;
    const pool = req.app.get('db');

    // Validate that we have an ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Resume ID is required.',
      });
    }

    // Validate job description input
    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid job description (at least 20 characters).',
      });
    }

    // Fetch the resume and verify ownership
    const resume = await ResumeModel.findById(pool, parseInt(id));

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.',
      });
    }

    if (resume.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to use this resume.',
      });
    }

    if (!resume.resume_text || resume.resume_text.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'This resume does not contain enough text for matching.',
      });
    }

    // Run AI job matching
    const matchResult = await matchJobDescription(resume.resume_text, jobDescription.trim());

    // Save the match result to the database
    const matchId = await ResumeModel.saveJobMatch(pool, {
      resume_id: resume.id,
      job_description: jobDescription.trim(),
      match_percentage: matchResult.matchPercentage,
      missing_keywords: matchResult.missingKeywords,
      improvements: matchResult.improvements,
    });

    return res.status(200).json({
      success: true,
      message: 'Job matching completed successfully.',
      data: {
        id: matchId,
        resume_id: resume.id,
        ...matchResult,
      },
    });
  } catch (error) {
    console.error('Match error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to match resume with job description.',
    });
  }
};

/**
 * GET /api/resumes
 *
 * Get the authenticated user's resume history.
 * Returns a summary list (without full text) for performance.
 */
const getHistory = async (req, res) => {
  try {
    const pool = req.app.get('db');
    const resumes = await ResumeModel.findByUserId(pool, req.user.id);

    return res.status(200).json({
      success: true,
      data: resumes,
      count: resumes.length,
    });
  } catch (error) {
    console.error('getHistory error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve resume history.',
    });
  }
};

/**
 * GET /api/resumes/:id
 *
 * Get a specific resume with all its analysis data,
 * suggestions, missing skills, and job matches.
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.get('db');

    const resume = await ResumeModel.findById(pool, parseInt(id));

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.',
      });
    }

    // Ensure ownership (unless admin)
    if (resume.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this resume.',
      });
    }

    return res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    console.error('getById error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve the resume.',
    });
  }
};

/**
 * DELETE /api/resumes/:id
 *
 * Delete a specific resume and all its associated data.
 */
const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.get('db');

    // Fetch the resume to verify it exists and check ownership
    const resume = await ResumeModel.findById(pool, parseInt(id));

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.',
      });
    }

    if (resume.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this resume.',
      });
    }

    await ResumeModel.deleteById(pool, parseInt(id));

    return res.status(200).json({
      success: true,
      message: 'Resume deleted successfully.',
    });
  } catch (error) {
    console.error('deleteResume error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete the resume.',
    });
  }
};

/**
 * GET /api/resume/:id/download
 *
 * Download the extracted plain text of the resume.
 */
const downloadResume = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.get('db');

    const resume = await ResumeModel.findById(pool, parseInt(id));

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.',
      });
    }

    // Ensure ownership (unless admin)
    if (resume.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to download this resume.',
      });
    }

    // Form safe filename
    const origExt = resume.file_name.substring(resume.file_name.lastIndexOf('.'));
    const safeBaseName = resume.file_name.replace(origExt, '').replace(/[^a-zA-Z0-9-_]/g, '_');
    const downloadName = `${safeBaseName}_extracted.txt`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    return res.send(resume.resume_text);
  } catch (error) {
    console.error('downloadResume error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to download the resume.',
    });
  }
};

module.exports = { upload, analyze, matchJob, getHistory, getById, deleteResume, downloadResume };
