import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold text-dark-900 dark:text-white">{label}</p>
      <p className="text-sm font-bold" style={{ color: payload[0].color || '#6366f1' }}>
        {payload[0].value}%
      </p>
    </div>
  );
};

export default function MatchPercentageChart({
  matchPercentage = 0,
  missingKeywords = [],
  improvements = [],
}) {
  // Radar data – synthetic dimensions based on the match
  const radarData = [
    { dimension: 'Keywords', value: Math.max(matchPercentage - missingKeywords.length * 3, 10) },
    { dimension: 'Skills', value: Math.min(matchPercentage + 8, 100) },
    { dimension: 'Experience', value: Math.min(matchPercentage + 5, 100) },
    { dimension: 'Education', value: Math.min(matchPercentage + 12, 100) },
    { dimension: 'Overall', value: matchPercentage },
  ];

  // Bar data for missing keywords impact
  const barData = missingKeywords.slice(0, 8).map((kw, i) => ({
    name: kw,
    impact: Math.max(15 - i * 2, 3),
  }));

  const barColors = [
    '#f43f5e', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#10b981', '#06b6d4', '#6366f1',
  ];

  return (
    <div className="glass card-glow rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="font-display font-semibold text-dark-900 dark:text-white">
            Job Match Analysis
          </h3>
          <p className="text-xs text-dark-500 dark:text-dark-400">
            How well your resume matches the job description
          </p>
        </div>
      </div>

      {/* Match percentage hero */}
      <div className="text-center mb-6">
        <div className="inline-flex items-baseline gap-1">
          <span className="text-5xl font-display font-bold gradient-text">{matchPercentage}</span>
          <span className="text-xl font-semibold text-dark-400">%</span>
        </div>
        <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">Match Score</p>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar chart */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-dark-500 dark:text-dark-400 mb-3">
            Dimension Breakdown
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(148,163,184,0.2)" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <Radar
                  name="Match"
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar chart – keyword impact */}
        {barData.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-dark-500 dark:text-dark-400 mb-3">
              Missing Keywords Impact
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="impact" radius={[0, 6, 6, 0]} barSize={20}>
                    {barData.map((_, idx) => (
                      <Cell key={idx} fill={barColors[idx % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Improvements */}
      {improvements.length > 0 && (
        <div className="mt-6 pt-5 border-t border-dark-200/50 dark:border-dark-700/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-dark-500 dark:text-dark-400 mb-3">
            Recommended Improvements
          </p>
          <ul className="space-y-2">
            {improvements.map((imp, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-dark-700 dark:text-dark-300">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                {imp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
