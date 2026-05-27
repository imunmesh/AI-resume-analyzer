import { useState } from 'react';
import {
  HiOutlineLightBulb,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineCheckCircle,
  HiOutlineKey,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
} from 'react-icons/hi';

function SuggestionItem({ suggestion, index }) {
  const [open, setOpen] = useState(false);

  const icons = [HiOutlineCheckCircle, HiOutlineKey, HiOutlineBriefcase, HiOutlineAcademicCap];
  const Icon = icons[index % icons.length];
  const colors = [
    'text-primary-500',
    'text-accent-cyan',
    'text-accent-emerald',
    'text-accent-amber',
  ];

  return (
    <div
      className={`group rounded-xl border transition-all duration-300 ${
        open
          ? 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10'
          : 'border-dark-200 dark:border-dark-800 hover:border-primary-300 dark:hover:border-dark-700'
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full text-left px-4 py-3.5"
      >
        <Icon className={`h-5 w-5 flex-shrink-0 ${colors[index % colors.length]}`} />
        <span className="text-sm font-medium text-dark-800 dark:text-dark-200 flex-1 line-clamp-2">
          {typeof suggestion === 'string' ? suggestion : suggestion.title || suggestion}
        </span>
        {open ? (
          <HiOutlineChevronUp className="h-4 w-4 text-dark-400 flex-shrink-0" />
        ) : (
          <HiOutlineChevronDown className="h-4 w-4 text-dark-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 pl-12 animate-slide-down">
          <p className="text-sm text-dark-600 dark:text-dark-400 leading-relaxed">
            {typeof suggestion === 'string'
              ? 'Consider implementing this suggestion to strengthen your resume and improve your chances with ATS systems.'
              : suggestion.detail || suggestion.description || suggestion}
          </p>
        </div>
      )}
    </div>
  );
}

export default function SuggestionsPanel({
  suggestions = [],
  keywordOptimization = [],
  experienceEvaluation = '',
  projectEvaluation = '',
}) {
  const [showAll, setShowAll] = useState(false);
  const allSuggestions = [...suggestions, ...keywordOptimization];
  const visibleSuggestions = showAll ? allSuggestions : allSuggestions.slice(0, 5);

  return (
    <div className="glass card-glow rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <HiOutlineLightBulb className="h-5 w-5 text-accent-amber" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-dark-900 dark:text-white">
            Suggestions & Insights
          </h3>
          <p className="text-xs text-dark-500 dark:text-dark-400">
            {allSuggestions.length} improvement{allSuggestions.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Evaluations */}
      {(experienceEvaluation || projectEvaluation) && (
        <div className="space-y-3 mb-5">
          {experienceEvaluation && (
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                Experience Evaluation
              </p>
              <p className="text-sm text-dark-700 dark:text-dark-300 leading-relaxed">
                {experienceEvaluation}
              </p>
            </div>
          )}
          {projectEvaluation && (
            <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-200 dark:border-cyan-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1">
                Project Evaluation
              </p>
              <p className="text-sm text-dark-700 dark:text-dark-300 leading-relaxed">
                {projectEvaluation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Suggestion items */}
      <div className="space-y-2">
        {visibleSuggestions.map((s, i) => (
          <SuggestionItem key={i} suggestion={s} index={i} />
        ))}
      </div>

      {allSuggestions.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-sm font-medium text-primary-500 hover:text-primary-400 transition-colors"
        >
          {showAll
            ? 'Show less'
            : `Show ${allSuggestions.length - 5} more suggestions`}
        </button>
      )}

      {allSuggestions.length === 0 && (
        <p className="text-sm text-dark-500 dark:text-dark-400 text-center py-4">
          No suggestions available yet. Analyze your resume first.
        </p>
      )}
    </div>
  );
}
