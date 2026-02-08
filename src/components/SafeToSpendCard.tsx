'use client'

interface SafeToSpendCardProps {
  budget: number
  spent: number
}

export default function SafeToSpendCard({ budget, spent }: SafeToSpendCardProps) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysRemaining = daysInMonth - now.getDate() + 1
  const remaining = budget - spent
  const safeToSpend = remaining / Math.max(daysRemaining, 1)
  const avgDailyBudget = budget / daysInMonth

  // Color coding: green if > avg daily budget, orange if < 50%, red if negative
  let colorClass: string
  let bgClass: string
  let borderClass: string
  let labelText: string

  if (safeToSpend < 0) {
    colorClass = 'text-red-600 dark:text-red-400'
    bgClass = 'bg-red-50 dark:bg-red-900/20'
    borderClass = 'border-red-200 dark:border-red-800'
    labelText = 'Over budget'
  } else if (safeToSpend < avgDailyBudget * 0.5) {
    colorClass = 'text-amber-600 dark:text-amber-400'
    bgClass = 'bg-amber-50 dark:bg-amber-900/20'
    borderClass = 'border-amber-200 dark:border-amber-800'
    labelText = 'Tight budget'
  } else {
    colorClass = 'text-green-600 dark:text-green-400'
    bgClass = 'bg-green-50 dark:bg-green-900/20'
    borderClass = 'border-green-200 dark:border-green-800'
    labelText = 'On track'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount))
  }

  return (
    <div className={`rounded-xl border ${borderClass} ${bgClass} p-4 mb-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Safe to Spend Today
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className={`text-2xl font-bold ${colorClass}`}>
              {safeToSpend < 0 ? '-' : ''}{formatCurrency(safeToSpend)}
            </p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              safeToSpend < 0
                ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                : safeToSpend < avgDailyBudget * 0.5
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
            }`}>
              {labelText}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {formatCurrency(remaining)} remaining
          </p>
        </div>
      </div>

      {/* Daily breakdown bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Daily avg: {formatCurrency(avgDailyBudget)}/day</span>
          <span>Safe: {formatCurrency(Math.max(safeToSpend, 0))}/day</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              safeToSpend < 0
                ? 'bg-red-500'
                : safeToSpend < avgDailyBudget * 0.5
                ? 'bg-amber-500'
                : 'bg-green-500'
            }`}
            style={{
              width: `${Math.min(Math.max((safeToSpend / avgDailyBudget) * 100, 0), 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
