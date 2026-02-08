'use client'

interface DebtSummaryCardsProps {
  totalDebt: number
  monthlyEmi: number
  totalInterest: number
  payoffMonths: number
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatPayoffDate(months: number): string {
  if (months <= 0) return 'Paid off'
  const date = new Date()
  date.setMonth(date.getMonth() + months)
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

export default function DebtSummaryCards({
  totalDebt,
  monthlyEmi,
  totalInterest,
  payoffMonths,
}: DebtSummaryCardsProps) {
  const cards = [
    {
      label: 'Total Debt',
      value: formatCurrency(totalDebt),
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Monthly EMI Total',
      value: formatCurrency(monthlyEmi),
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Total Interest Remaining',
      value: formatCurrency(totalInterest),
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      label: 'Estimated Payoff Date',
      value: formatPayoffDate(payoffMonths),
      subtext: payoffMonths > 0 ? `${payoffMonths} months` : '',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
              {card.icon}
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {card.label}
          </p>
          <p className={`text-lg md:text-xl font-bold mt-1 ${card.color}`}>
            {card.value}
          </p>
          {card.subtext && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {card.subtext}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
