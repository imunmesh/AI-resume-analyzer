import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResume, analyzeResume, matchJob } from '../services/api';
import ATSScoreCard from '../components/ATSScoreCard';
import SkillGapCard from '../components/SkillGapCard';
import SuggestionsPanel from '../components/SuggestionsPanel';
import MatchPercentageChart from '../components/MatchPercentageChart';
import JobDescriptionInput from '../components/JobDescriptionInput';
import ExportButton from '../components/ExportButton';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  HiOutlineArrowLeft,
  HiOutlineBriefcase,
  HiOutlineLightningBolt,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function AnalysisResultPage() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [jobMatch, setJobMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    fetchResume();
  }, [id]);

  const fetchResume = async () => {
    try {
      const { data } = await getResume(id);
      const r = data.data || data.resume || data;
      setResume(r);
      setAnalysis(r.analysis_data || r.analysis || null);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to load resume');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const { data } = await analyzeResume(id);
      const r = data.data || data.resume || data;
      setResume(r);
      setAnalysis(r.analysis_data || r.analysis || r);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleJobMatch = async (jobDescription) => {
    setMatching(true);
    try {
      const { data } = await matchJob(id, jobDescription);
      setJobMatch(data.data || data.match || data);
      toast.success('Job matching complete!');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Job matching failed');
    } finally {
      setMatching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading analysis..." />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark-500 dark:text-dark-400 mb-4">Resume not found</p>
          <Link to="/dashboard" className="btn-primary text-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 page-transition">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 no-print">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-dark-500 dark:text-dark-400 hover:text-primary-500 transition-colors mb-2"
            >
              <HiOutlineArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-dark-900 dark:text-white">
              {resume.file_name || resume.fileName || resume.originalName || 'Resume Analysis'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {!analysis && (
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="btn-primary flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <HiOutlineLightningBolt className="h-5 w-5" />
                    Analyze Resume
                  </>
                )}
              </button>
            )}
            {analysis && <ExportButton />}
          </div>
        </div>

        {/* Analyzing spinner */}
        {analyzing && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <LoadingSpinner size="lg" text="AI is analyzing your resume..." />
              <p className="text-xs text-dark-400 mt-4">This may take 10-30 seconds</p>
            </div>
          </div>
        )}

        {/* No analysis yet */}
        {!analysis && !analyzing && (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
              <HiOutlineLightningBolt className="h-8 w-8 text-primary-500" />
            </div>
            <h2 className="font-display font-semibold text-xl text-dark-900 dark:text-white mb-2">
              Resume Not Yet Analyzed
            </h2>
            <p className="text-dark-500 dark:text-dark-400 mb-6 max-w-md mx-auto">
              Click the "Analyze Resume" button above to get your ATS score, skill gap analysis,
              and personalized suggestions.
            </p>
            <button onClick={handleAnalyze} className="btn-primary inline-flex items-center gap-2">
              <HiOutlineLightningBolt className="h-5 w-5" />
              Start Analysis
            </button>
          </div>
        )}

        {/* Analysis results */}
        {analysis && !analyzing && (
          <div className="space-y-8">
            {/* Top row: Score + Recommended Roles */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ATSScoreCard score={analysis.atsScore} />

              {/* Recommended roles */}
              <div className="lg:col-span-2 glass card-glow rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                    <HiOutlineBriefcase className="h-5 w-5 text-accent-cyan" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-dark-900 dark:text-white">
                      Recommended Roles
                    </h3>
                    <p className="text-xs text-dark-500 dark:text-dark-400">
                      Roles that match your profile
                    </p>
                  </div>
                </div>
                {analysis.recommendedRoles?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.recommendedRoles.map((role, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-primary-500/10 to-accent-cyan/10 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 hover:scale-105 transition-transform cursor-default"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-dark-500 dark:text-dark-400">
                    No specific roles recommended. Analyze your resume for personalized suggestions.
                  </p>
                )}
              </div>
            </div>

            {/* Middle row: Skill Gap + Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkillGapCard missingSkills={analysis.missingSkills} />
              <SuggestionsPanel
                suggestions={analysis.suggestions}
                keywordOptimization={analysis.keywordOptimization}
                experienceEvaluation={analysis.experienceEvaluation}
                projectEvaluation={analysis.projectEvaluation}
              />
            </div>

            {/* Job Description Match Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
              <JobDescriptionInput onMatch={handleJobMatch} loading={matching} />
              {jobMatch && (
                <MatchPercentageChart
                  matchPercentage={jobMatch.matchPercentage}
                  missingKeywords={jobMatch.missingKeywords}
                  improvements={jobMatch.improvements}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
