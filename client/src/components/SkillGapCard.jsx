import { HiOutlineExclamationCircle, HiOutlineLightningBolt } from 'react-icons/hi';

export default function SkillGapCard({ missingSkills = [] }) {
  const getSkillColor = (index) => {
    const colors = [
      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    ];
    return colors[index % colors.length];
  };

  if (!missingSkills.length) {
    return (
      <div className="glass card-glow rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <HiOutlineLightningBolt className="h-5 w-5 text-accent-emerald" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-dark-900 dark:text-white">
              Skill Gap Analysis
            </h3>
            <p className="text-xs text-dark-500 dark:text-dark-400">
              Missing skills from your resume
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
          <span className="text-accent-emerald text-2xl">🎉</span>
          <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
            Great job! No major skill gaps detected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass card-glow rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <HiOutlineExclamationCircle className="h-5 w-5 text-accent-rose" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-dark-900 dark:text-white">
            Skill Gap Analysis
          </h3>
          <p className="text-xs text-dark-500 dark:text-dark-400">
            {missingSkills.length} skill{missingSkills.length !== 1 ? 's' : ''} missing
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {missingSkills.map((skill, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 hover:scale-105 cursor-default ${getSkillColor(i)}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-dark-100/50 dark:bg-dark-800/50">
        <p className="text-xs text-dark-500 dark:text-dark-400">
          💡 <span className="font-medium">Tip:</span> Adding these skills to your resume can
          significantly improve your ATS score and match rate.
        </p>
      </div>
    </div>
  );
}
