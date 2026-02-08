'use client'

interface KpiCardsProps {
  totalIncome: number
  totalExpenses: number
  netSavings: number
  savingsRate: number
  monthOverMonthChange: number
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function ChangeIndicator({ value, inverted = false }: { value: number; inverted?: boolean }) {
  const isPositive = inverted ? value < 0 : value > 0
  const isNegative = inverted ? value > 0 : value < 0
  const absValue = Math.abs(value)

  if (absValue === 0) {
    return (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        No change
      </span>
    )
  }

  return (
    <span
      className={`text-xs font-medium flex items-center gap-0.5 ${
        isPositive
          ? 'text-green-600 dark:text-green-400'
          : isNegative
          ? 'text-red-600 dark:text-red-400'
          : 'text-gray-500 dark:text-gray-400'
      }`}
    >
      {value > 0 ? (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l5-5 5 5" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l5 5 5-5" />
        </svg>
      )}
      {absValue.toFixed(1)}% vs last month
    </span>
  )
}

export default function KpiCards({
  totalIncome,
  totalExpenses,
  netSavings,
  savingsRate,
  monthOverMonthChange,
}: KpiCardsProps) {
  const cards = [
    {
      label: 'Total Income',
      value: formatCurrency(totalIncome),
      colorClass: 'text-green-600 dark:text-green-400',
      bgClass: 'bg-green-50 dark:bg-green-900/20',
      iconBg: 'bg-green-100 dark:bg-green-900/40',
      icon: (
        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      change: null,
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      colorClass: 'text-red-600 dark:text-red-400',
      bgClass: 'bg-red-50 dark:bg-red-900/20',
      iconBg: 'bg-red-100 dark:bg-red-900/40',
      icon: (
        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      change: <ChangeIndicator value={monthOverMonthChange} inverted />,
    },
    {
      label: 'Net Savings',
      value: formatCurrency(netSavings),
      colorClass: netSavings >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400',
      bgClass: 'bg-blue-50 dark:bg-blue-900/20',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      icon: (
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      change: null,
    },
    {
      label: 'Savings Rate',
      value: `${savingsRate}%`,
      colorClass: savingsRate >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400',
      bgClass: 'bg-purple-50 dark:bg-purple-900/20',
      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
      icon: (
        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      change: null,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 md:p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${card.iconBg}`}>
              {card.icon}
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {card.label}
            </span>
          </div>
          <p className={`text-xl md:text-2xl font-bold ${card.colorClass}`}>
            {card.value}
          </p>
          {card.change && (
            <div className="mt-2">{card.change}</div>
          )}
        </div>
      ))}
    </div>
  )
}
