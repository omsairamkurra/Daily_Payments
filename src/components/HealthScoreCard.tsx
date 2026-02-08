'use client'

interface HealthScoreCardProps {
  score: number
  loading?: boolean
}

function getScoreColor(score: number): { stroke: string; text: string; label: string } {
  if (score >= 75) {
    return {
      stroke: '#22c55e', // green-500
      text: 'text-green-600 dark:text-green-400',
      label: 'Excellent',
    }
  } else if (score >= 60) {
    return {
      stroke: '#eab308', // yellow-500
      text: 'text-yellow-600 dark:text-yellow-400',
      label: 'Good',
    }
  } else if (score >= 40) {
    return {
      stroke: '#f97316', // orange-500
      text: 'text-orange-600 dark:text-orange-400',
      label: 'Fair',
    }
  } else {
    return {
      stroke: '#ef4444', // red-500
      text: 'text-red-600 dark:text-red-400',
      label: 'Poor',
    }
  }
}

export default function HealthScoreCard({ score, loading }: HealthScoreCardProps) {
  const { stroke, text, label } = getScoreColor(score)

  // SVG circle gauge
  const size = 160
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = loading ? 0 : (score / 100) * circumference
  const offset = circumference - progress

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Financial Health Score
      </h3>

      {loading ? (
        <div className="flex flex-col items-center justify-center" style={{ width: size, height: size }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Calculating...</p>
        </div>
      ) : (
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Score number in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${text}`}>
              {score}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">/ 100</span>
          </div>
        </div>
      )}

      {!loading && (
        <div className="mt-4 text-center">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              score >= 75
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : score >= 60
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                : score >= 40
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}
          >
            {label}
          </span>
        </div>
      )}
    </div>
  )
}
