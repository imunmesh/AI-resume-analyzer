import { useState, useEffect, useRef } from 'react';

export default function ATSScoreCard({ score = 0, label = 'ATS Score' }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  // Intersection Observer for scroll-in animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Animate score count-up
  useEffect(() => {
    if (!isVisible) return;
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [score, isVisible]);

  const getScoreColor = (s) => {
    if (s >= 80) return { stroke: '#10b981', glow: 'rgba(16,185,129,0.3)', label: 'Excellent', bg: 'from-emerald-500/10 to-emerald-500/5' };
    if (s >= 60) return { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.3)', label: 'Good', bg: 'from-amber-500/10 to-amber-500/5' };
    if (s >= 40) return { stroke: '#f97316', glow: 'rgba(249,115,22,0.3)', label: 'Fair', bg: 'from-orange-500/10 to-orange-500/5' };
    return { stroke: '#f43f5e', glow: 'rgba(244,63,94,0.3)', label: 'Needs Work', bg: 'from-red-500/10 to-red-500/5' };
  };

  const { stroke, glow, label: scoreLabel, bg } = getScoreColor(score);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div
      ref={ref}
      className={`glass card-glow rounded-2xl p-6 flex flex-col items-center gap-4 bg-gradient-to-b ${bg}`}
    >
      <h3 className="text-sm font-semibold uppercase tracking-wider text-dark-500 dark:text-dark-400">
        {label}
      </h3>

      {/* SVG Circular Gauge */}
      <div className="relative w-48 h-48">
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 200 200"
        >
          {/* Background track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-dark-200 dark:text-dark-800"
            strokeWidth="10"
          />
          {/* Score arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={isVisible ? offset : circumference}
            className="transition-all duration-[1500ms] ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${glow})`,
            }}
          />
          {/* Decorative dots */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = ((tick / 100) * 360 - 90) * (Math.PI / 180);
            const x = 100 + (radius + 15) * Math.cos(angle);
            const y = 100 + (radius + 15) * Math.sin(angle);
            return (
              <circle
                key={tick}
                cx={x}
                cy={y}
                r="2"
                className="fill-dark-300 dark:fill-dark-700"
              />
            );
          })}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-display font-bold tabular-nums"
            style={{ color: stroke }}
          >
            {animatedScore}
          </span>
          <span className="text-xs font-medium text-dark-500 dark:text-dark-400 mt-1">
            / 100
          </span>
        </div>
      </div>

      {/* Score label badge */}
      <div
        className="px-4 py-1.5 rounded-full text-sm font-semibold"
        style={{
          backgroundColor: `${stroke}15`,
          color: stroke,
        }}
      >
        {scoreLabel}
      </div>
    </div>
  );
}
