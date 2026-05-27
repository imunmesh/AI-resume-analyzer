import { useState } from 'react';
import { HiOutlineSearch, HiOutlineLightningBolt } from 'react-icons/hi';

export default function JobDescriptionInput({ onMatch, loading = false }) {
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (jobDescription.trim().length < 50) {
      setError('Please paste a more detailed job description (at least 50 characters).');
      return;
    }
    setError('');
    onMatch?.(jobDescription.trim());
  };

  const charCount = jobDescription.length;

  return (
    <div className="glass card-glow rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <HiOutlineSearch className="h-5 w-5 text-accent-violet" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-dark-900 dark:text-white">
            Job Description Match
          </h3>
          <p className="text-xs text-dark-500 dark:text-dark-400">
            Paste a job description to see how well your resume matches
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              if (error) setError('');
            }}
            rows={6}
            placeholder="Paste the job description here...

Example: We are looking for a Full Stack Developer with 3+ years of experience in React, Node.js, and AWS..."
            className={`input-field resize-none ${
              error ? 'border-red-400 dark:border-red-500 focus:ring-red-400/40' : ''
            }`}
          />

          {/* Character count */}
          <span
            className={`absolute bottom-3 right-3 text-xs ${
              charCount < 50 ? 'text-dark-400' : 'text-accent-emerald'
            }`}
          >
            {charCount} chars
          </span>
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-2 text-sm text-red-500 dark:text-red-400 animate-slide-down">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !jobDescription.trim()}
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Matching...
            </>
          ) : (
            <>
              <HiOutlineLightningBolt className="h-5 w-5" />
              Match with Job Description
            </>
          )}
        </button>
      </form>
    </div>
  );
}
