'use client'

interface GoalProgressExtendedProps {
  currentAmount: number
  targetAmount: number
  milestones: Array<{ milestoneType: number; achievedAt: string | null }>
  targetDate?: string
}

const MARKERS = [25, 50, 75]

export default function GoalProgressExtended({
  currentAmount,
  targetAmount,
  milestones,
  targetDate,
}: GoalProgressExtendedProps) {
  const percentage = targetAmount > 0
    ? Math.min((currentAmount / targetAmount) * 100, 100)
    : 0

  const achievedTypes = new Set(
    milestones
      .filter((m) => m.achievedAt !== null)
      .map((m) => m.milestoneType)
  )

  // Calculate days remaining until target date
  const daysRemaining = targetDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(targetDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null

  // Calculate projected completion date based on current saving rate
  // We use the goal's created_at approximation - time since first save
  const remaining = targetAmount - currentAmount
  let projectedDate: string | null = null

  if (currentAmount > 0 && remaining > 0 && targetDate) {
    // Simple projection: if user saved currentAmount over elapsed days,
    // how many more days to save remaining?
    const goalCreatedApprox = new Date()
    goalCreatedApprox.setDate(goalCreatedApprox.getDate() - 30) // approximate 30 days of saving
    const elapsedDays = Math.max(
      1,
      Math.ceil(
        (new Date().getTime() - goalCreatedApprox.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    )
    const dailyRate = currentAmount / elapsedDays
    const daysToComplete = Math.ceil(remaining / dailyRate)
    const projDate = new Date()
    projDate.setDate(projDate.getDate() + daysToComplete)
    projectedDate = projDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="w-full">
      {/* Progress bar with milestone markers */}
      <div className="relative w-full mb-4">
        {/* Background bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative overflow-visible">
          {/* Progress fill */}
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500 relative"
            style={{ width: `${percentage}%` }}
          >
            {/* Percentage label on the progress bar */}
            {percentage > 10 && (
              <span className="absolute right-1 top-0 h-full flex items-center text-[10px] font-bold text-white">
                {percentage.toFixed(1)}%
              </span>
            )}
          </div>

          {/* Milestone markers at 25%, 50%, 75% */}
          {MARKERS.map((marker) => (
            <div
              key={marker}
              className="absolute top-1/2 -translate-y-1/2"
              style={{ left: `${marker}%` }}
            >
              <div
                className={`w-3 h-3 rounded-full border-2 -ml-1.5 transition-colors ${
                  achievedTypes.has(marker)
                    ? 'bg-yellow-400 border-yellow-500'
                    : percentage >= marker
                    ? 'bg-blue-400 border-blue-500'
                    : 'bg-white dark:bg-gray-600 border-gray-400 dark:border-gray-500'
                }`}
                title={`${marker}%`}
              />
            </div>
          ))}
        </div>

        {/* Marker labels */}
        <div className="relative w-full mt-1">
          {MARKERS.map((marker) => (
            <span
              key={marker}
              className="absolute text-[10px] text-gray-400 dark:text-gray-500 -translate-x-1/2"
              style={{ left: `${marker}%` }}
            >
              {marker}%
            </span>
          ))}
        </div>
      </div>

      {/* Amount summary */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatCurrency(currentAmount)} saved
        </span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {formatCurrency(targetAmount)} target
        </span>
      </div>

      {/* Info row: days remaining + projected completion */}
      <div className="flex flex-col gap-1">
        {daysRemaining !== null && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Days remaining
            </span>
            <span
              className={`text-xs font-medium ${
                daysRemaining <= 7
                  ? 'text-red-600 dark:text-red-400'
                  : daysRemaining <= 30
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {daysRemaining === 0
                ? 'Due today'
                : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`}
            </span>
          </div>
        )}

        {projectedDate && percentage < 100 && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Projected completion
            </span>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {projectedDate}
            </span>
          </div>
        )}

        {percentage >= 100 && (
          <div className="text-center">
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              Goal completed!
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
