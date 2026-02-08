'use client'

interface Investment {
  id: string
  name: string
  type: string
  app: string
  investedAmount: number
  currentValue: number | null
  units: number | null
  purchaseDate: string
  notes: string | null
  frequency?: string
  isSip?: boolean
  sipAmount?: number | null
  nextSipDate?: string | null
  goalId?: string | null
}

interface InvestmentListProps {
  investments: Investment[]
  onView: (investment: Investment) => void
  onEdit: (investment: Investment) => void
  onDelete: (id: string) => void
}

const TYPE_LABELS: Record<string, string> = {
  mutual_fund: 'Mutual Fund',
  stock: 'Stock',
  sip: 'SIP',
  fd: 'FD',
  ppf: 'PPF',
  gold: 'Gold',
  silver: 'Silver',
  other: 'Other',
}

export default function InvestmentList({
  investments,
  onView,
  onEdit,
  onDelete,
}: InvestmentListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const calculateGainLoss = (invested: number, current: number | null) => {
    if (current === null) return null
    return current - invested
  }

  const calculateGainLossPercentage = (invested: number, current: number | null) => {
    if (current === null || invested === 0) return null
    return ((current - invested) / invested) * 100
  }

  if (investments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">No investments yet. Add your first investment!</p>
      </div>
    )
  }

  return (
    <div>
      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {investments.map((investment) => {
          const gainLoss = calculateGainLoss(investment.investedAmount, investment.currentValue)
          const gainLossPercentage = calculateGainLossPercentage(investment.investedAmount, investment.currentValue)

          return (
            <div key={investment.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{investment.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {investment.app || 'N/A'} &middot; {formatDate(investment.purchaseDate)}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                      {TYPE_LABELS[investment.type] || investment.type}
                    </span>
                    {investment.frequency && investment.frequency !== 'one_time' && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded capitalize">
                        {investment.frequency}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {formatCurrency(investment.investedAmount)}
                  </p>
                  {gainLoss !== null && (
                    <p className={`text-sm ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                      {gainLossPercentage !== null && (
                        <span className="text-xs"> ({gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%)</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button onClick={() => onView(investment)} className="text-green-600 text-sm">View</button>
                <button onClick={() => onEdit(investment)} className="text-blue-600 text-sm">Edit</button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this investment?')) {
                      onDelete(investment.id)
                    }
                  }}
                  className="text-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                    App
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Invested
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Current Value
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Gain/Loss
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Date
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {investments.map((investment) => {
                  const gainLoss = calculateGainLoss(
                    investment.investedAmount,
                    investment.currentValue
                  )
                  const gainLossPercentage = calculateGainLossPercentage(
                    investment.investedAmount,
                    investment.currentValue
                  )

                  return (
                    <tr key={investment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{investment.name}</p>
                          {investment.units && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {investment.units} units
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded inline-block w-fit">
                            {TYPE_LABELS[investment.type] || investment.type}
                          </span>
                          {investment.frequency && investment.frequency !== 'one_time' && (
                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded inline-block w-fit capitalize">
                              {investment.frequency}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {investment.app || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                        {formatCurrency(investment.investedAmount)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                        {investment.currentValue !== null ? (
                          formatCurrency(investment.currentValue)
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {gainLoss !== null ? (
                          <div
                            className={
                              gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            <p className="font-medium">
                              {gainLoss >= 0 ? '+' : ''}
                              {formatCurrency(gainLoss)}
                            </p>
                            <p className="text-xs">
                              ({gainLossPercentage! >= 0 ? '+' : ''}
                              {gainLossPercentage!.toFixed(2)}%)
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(investment.purchaseDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => onView(investment)}
                            className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => onEdit(investment)}
                            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm('Are you sure you want to delete this investment?')
                              ) {
                                onDelete(investment.id)
                              }
                            }}
                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
