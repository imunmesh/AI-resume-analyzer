/**
 * ============================================
 * Gemini AI Service
 * ============================================
 * Uses Google Gemini AI to:
 *   1. Analyze resumes (ATS score, skills, suggestions)
 *   2. Match resumes against job descriptions
 *
 * All responses are structured JSON for easy parsing.
 * ============================================
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

/**
 * Initialize and get a specific Gemini model instance.
 */
const getModelInstance = (modelName) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please set it in your .env file.'
    );
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Analyze a resume and return structured results.
 *
 * Uses a detailed prompt to get:
 * - ATS score (0-100)
 * - Missing skills
 * - Improvement suggestions
 * - Recommended roles
 * - Keyword optimization tips
 * - Experience evaluation
 * - Project evaluation
 *
 * @param {string} resumeText - Plain text extracted from the resume
 * @returns {object} Structured analysis results
 */
const analyzeResume = async (resumeText) => {
  const modelsToTry = process.env.GEMINI_MODEL
    ? [process.env.GEMINI_MODEL]
    : ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.5-flash'];

  const prompt = `You are an expert ATS (Applicant Tracking System) analyzer and career advisor.
Analyze the following resume thoroughly and provide a detailed evaluation.

IMPORTANT: Respond ONLY with a valid JSON object. Do NOT include any text before or after the JSON.
Do NOT wrap it in markdown code blocks. Just return raw JSON.

The JSON must follow this exact structure:
{
  "atsScore": <number between 0 and 100>,
  "missingSkills": [<array of strings - important skills that are missing from the resume>],
  "suggestions": [<array of strings - specific, actionable improvement suggestions>],
  "recommendedRoles": [<array of strings - job roles this candidate is best suited for>],
  "keywordOptimization": [<array of strings - specific keywords the candidate should add to improve ATS score>],
  "experienceEvaluation": "<string - detailed evaluation of the candidate's work experience, strengths, and gaps>",
  "projectEvaluation": "<string - detailed evaluation of projects listed, their impact, and how to improve descriptions>"
}

Scoring criteria for ATS score:
- Format and structure (20%): Clear headings, consistent formatting, proper sections
- Keywords and skills (25%): Relevant technical/professional keywords present
- Experience quality (25%): Quantified achievements, action verbs, relevant experience
- Education and certifications (10%): Relevant education, certifications listed
- Overall readability (10%): Clean layout, appropriate length, no errors
- Contact information (10%): Complete and professional contact details

Resume to analyze:
---
${resumeText}
---

Remember: Respond with ONLY the JSON object, nothing else.`;

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Attempting AI analysis with model: ${modelName}`);
      const geminiModel = getModelInstance(modelName);
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Clean up the response — remove markdown code fences if Gemini wraps them
      text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

      // Parse and validate the JSON response
      const analysisData = JSON.parse(text);

      // Validate required fields and apply defaults
      return {
        atsScore: Math.min(100, Math.max(0, Number(analysisData.atsScore) || 0)),
        missingSkills: Array.isArray(analysisData.missingSkills) ? analysisData.missingSkills : [],
        suggestions: Array.isArray(analysisData.suggestions) ? analysisData.suggestions : [],
        recommendedRoles: Array.isArray(analysisData.recommendedRoles) ? analysisData.recommendedRoles : [],
        keywordOptimization: Array.isArray(analysisData.keywordOptimization) ? analysisData.keywordOptimization : [],
        experienceEvaluation: analysisData.experienceEvaluation || 'No evaluation available.',
        projectEvaluation: analysisData.projectEvaluation || 'No evaluation available.',
      };
    } catch (error) {
      console.error(`⚠️ Gemini analyzeResume with "${modelName}" failed:`, error.message);
      lastError = error;

      // If it's a syntax error in parsing or a credentials issue, fail early
      if (error instanceof SyntaxError || error.message.includes('API_KEY')) {
        throw error;
      }
      // Otherwise, log and continue to the next model
    }
  }

  throw new Error(`AI analysis failed: ${lastError?.message || 'All models failed'}`);
};

/**
 * Match a resume against a job description.
 *
 * Returns:
 * - Match percentage (0-100)
 * - Missing keywords from the JD
 * - Specific improvements to tailor the resume
 *
 * @param {string} resumeText - Plain text from the resume
 * @param {string} jobDescription - The target job description text
 * @returns {object} Structured match results
 */
const matchJobDescription = async (resumeText, jobDescription) => {
  const modelsToTry = process.env.GEMINI_MODEL
    ? [process.env.GEMINI_MODEL]
    : ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.5-flash'];

  const prompt = `You are an expert ATS (Applicant Tracking System) analyzer and job matching specialist.
Compare the following resume against the provided job description and evaluate how well the candidate matches.

IMPORTANT: Respond ONLY with a valid JSON object. Do NOT include any text before or after the JSON.
Do NOT wrap it in markdown code blocks. Just return raw JSON.

The JSON must follow this exact structure:
{
  "matchPercentage": <number between 0 and 100>,
  "missingKeywords": [<array of strings - important keywords/skills from the job description that are missing from the resume>],
  "improvements": [<array of strings - specific, actionable suggestions to tailor the resume for this job>]
}

Matching criteria:
- Skill alignment (35%): How many required skills does the candidate have?
- Experience relevance (25%): How relevant is the candidate's experience to this role?
- Keyword overlap (20%): How many JD keywords appear in the resume?
- Education match (10%): Does the education meet the requirements?
- Overall fit (10%): General assessment of candidacy

Resume:
---
${resumeText}
---

Job Description:
---
${jobDescription}
---

Remember: Respond with ONLY the JSON object, nothing else.`;

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Attempting job matching with model: ${modelName}`);
      const geminiModel = getModelInstance(modelName);
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Clean up the response
      text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

      // Parse and validate
      const matchData = JSON.parse(text);

      return {
        matchPercentage: Math.min(100, Math.max(0, Number(matchData.matchPercentage) || 0)),
        missingKeywords: Array.isArray(matchData.missingKeywords) ? matchData.missingKeywords : [],
        improvements: Array.isArray(matchData.improvements) ? matchData.improvements : [],
      };
    } catch (error) {
      console.error(`⚠️ Gemini matchJobDescription with "${modelName}" failed:`, error.message);
      lastError = error;

      if (error instanceof SyntaxError || error.message.includes('API_KEY')) {
        throw error;
      }
    }
  }

  throw new Error(`AI job matching failed: ${lastError?.message || 'All models failed'}`);
};

module.exports = { analyzeResume, matchJobDescription };
