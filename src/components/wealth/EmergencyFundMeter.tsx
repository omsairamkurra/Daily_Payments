'use client'

interface EmergencyFundMeterProps {
  currentAmount: number
  targetAmount: number // 6 months of expenses
}

export default function EmergencyFundMeter({
  currentAmount,
  targetAmount,
}: EmergencyFundMeterProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const monthlyExpenses = targetAmount > 0 ? targetAmount / 6 : 0
  const monthsCovered = monthlyExpenses > 0 ? currentAmount / monthlyExpenses : 0
  const percentage = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0

  // Color based on months covered
  let barColor = 'bg-red-500'
  let textColor = 'text-red-600 dark:text-red-400'
  let statusText = 'Needs Attention'

  if (monthsCovered >= 4) {
    barColor = 'bg-green-500'
    textColor = 'text-green-600 dark:text-green-400'
    statusText = 'Healthy'
  } else if (monthsCovered >= 2) {
    barColor = 'bg-orange-500'
    textColor = 'text-orange-600 dark:text-orange-400'
    statusText = 'Building Up'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Emergency Fund
        </h3>
        <span className={`text-sm font-medium ${textColor}`}>{statusText}</span>
      </div>

      {targetAmount <= 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Add payments to calculate your monthly expenses and emergency fund target.
        </p>
      ) : (
        <>
          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-3">
            <div
              className={`${barColor} h-4 rounded-full transition-all duration-500`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Labels */}
          <div className="flex justify-between text-sm mb-4">
            <span className="text-gray-600 dark:text-gray-400">
              {formatCurrency(currentAmount)}
            </span>
            <span className="text-gray-500 dark:text-gray-500">
              Target: {formatCurrency(targetAmount)}
            </span>
          </div>

          {/* Months covered indicator */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className={`font-semibold ${textColor}`}>
                {monthsCovered.toFixed(1)} months
              </span>{' '}
              of expenses covered
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Based on avg. monthly spending of {formatCurrency(monthlyExpenses)}
            </p>
          </div>

          {/* Milestone markers */}
          <div className="flex justify-between mt-3 text-xs text-gray-400 dark:text-gray-500">
            <span>0</span>
            <span className={monthsCovered >= 2 ? 'text-orange-500' : ''}>2 mo</span>
            <span className={monthsCovered >= 4 ? 'text-green-500' : ''}>4 mo</span>
            <span className={monthsCovered >= 6 ? 'text-green-600 font-semibold' : ''}>
              6 mo
            </span>
          </div>
        </>
      )}
    </div>
  )
}
