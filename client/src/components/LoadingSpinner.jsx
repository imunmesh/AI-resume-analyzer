export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer glow ring */}
        <div
          className={`${sizes[size]} rounded-full border-2 border-primary-500/20 dark:border-primary-400/10`}
        />
        {/* Spinning arc */}
        <div
          className={`absolute inset-0 ${sizes[size]} rounded-full border-2 border-transparent border-t-primary-500 dark:border-t-primary-400 animate-spin`}
        />
        {/* Inner pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`rounded-full bg-primary-500/20 animate-pulse-slow ${
              size === 'sm'
                ? 'h-2 w-2'
                : size === 'md'
                ? 'h-3 w-3'
                : size === 'lg'
                ? 'h-5 w-5'
                : 'h-7 w-7'
            }`}
          />
        </div>
      </div>
      {text && (
        <p className="text-sm font-medium text-dark-500 dark:text-dark-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

/* Full-page version */
export function FullPageSpinner({ text = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-50/80 dark:bg-dark-950/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Animated orbiting dots */}
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary-500/20 animate-spin-slow" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-primary-500 border-r-accent-cyan animate-spin" />
          <div className="absolute inset-4 rounded-full border-2 border-transparent border-b-accent-violet animate-spin-slow" style={{ animationDirection: 'reverse' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-primary-500 animate-pulse-slow shadow-lg shadow-primary-500/50" />
          </div>
        </div>
        <p className="text-base font-medium text-dark-600 dark:text-dark-300">
          {text}
        </p>
      </div>
    </div>
  );
}
