'use client'

interface Section80CTrackerProps {
  total: number
  limit: number
  items: Array<{ description: string; amount: number; section: string }>
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function Section80CTracker({ total, limit, items }: Section80CTrackerProps) {
  const percentage = Math.min((total / limit) * 100, 100)
  const isMaxed = total >= limit
  const barColor = isMaxed ? 'bg-blue-600' : 'bg-green-500'
  const barBgColor = isMaxed ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-200 dark:bg-gray-700'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Section 80C Tracker
      </h3>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">
            {formatCurrency(total)} of {formatCurrency(limit)}
          </span>
          <span className={`font-semibold ${isMaxed ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
        <div className={`w-full h-3 rounded-full ${barBgColor}`}>
          <div
            className={`h-3 rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {isMaxed && (
        <p className="text-sm text-blue-600 dark:text-blue-400 mb-4 font-medium">
          Section 80C limit reached! Maximum deduction: {formatCurrency(limit)}
        </p>
      )}

      {!isMaxed && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          You can invest {formatCurrency(limit - total)} more to maximize your 80C deduction.
        </p>
      )}

      {/* Items list */}
      {items.length > 0 ? (
        <div className="space-y-2 mt-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Deduction Items
          </h4>
          {items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate mr-4">
                {item.description}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">
          No 80C deductions added yet. Add investments like PPF, ELSS, or manual deductions.
        </p>
      )}
    </div>
  )
}
