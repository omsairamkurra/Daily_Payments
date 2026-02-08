'use client'

interface BreakdownItem {
  score: number
  max: number
  details: string
}

interface HealthScoreBreakdownProps {
  breakdown: {
    savingsRate: BreakdownItem
    debtToIncome: BreakdownItem
    emergencyFund: BreakdownItem
    budgetAdherence: BreakdownItem
    investmentDiversity: BreakdownItem
  }
  recommendations: string[]
}

const LABELS: Record<string, string> = {
  savingsRate: 'Savings Rate',
  debtToIncome: 'Debt-to-Income',
  emergencyFund: 'Emergency Fund',
  budgetAdherence: 'Budget Adherence',
  investmentDiversity: 'Investment Diversity',
}

const COLORS: Record<string, { bar: string; bg: string }> = {
  savingsRate: {
    bar: 'bg-blue-500 dark:bg-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  debtToIncome: {
    bar: 'bg-purple-500 dark:bg-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
  },
  emergencyFund: {
    bar: 'bg-green-500 dark:bg-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
  },
  budgetAdherence: {
    bar: 'bg-orange-500 dark:bg-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
  },
  investmentDiversity: {
    bar: 'bg-pink-500 dark:bg-pink-400',
    bg: 'bg-pink-100 dark:bg-pink-900/30',
  },
}

export default function HealthScoreBreakdown({
  breakdown,
  recommendations,
}: HealthScoreBreakdownProps) {
  const entries = Object.entries(breakdown) as Array<
    [string, BreakdownItem]
  >

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Score Breakdown
      </h3>

      <div className="space-y-4">
        {entries.map(([key, item]) => {
          const label = LABELS[key] || key
          const color = COLORS[key] || { bar: 'bg-gray-500', bg: 'bg-gray-100' }
          const percentage = item.max > 0 ? (item.score / item.max) * 100 : 0

          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {label}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {item.score}/{item.max}
                </span>
              </div>

              <div className={`w-full rounded-full h-2.5 ${color.bg}`}>
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${color.bar}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {item.details}
              </p>
            </div>
          )
        })}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Recommendations
          </h4>

          <ul className="space-y-2">
            {recommendations.map((tip, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <span className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
