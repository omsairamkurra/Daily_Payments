'use client'

interface Investment {
  id: string
  name: string
  type: string
  investedAmount: number
  currentValue: number | null
  units: number | null
  purchaseDate: string
  notes: string | null
}

interface InvestmentListProps {
  investments: Investment[]
  onEdit: (investment: Investment) => void
  onDelete: (id: string) => void
}

const TYPE_LABELS: Record<string, string> = {
  mutual_fund: 'Mutual Fund',
  stock: 'Stock',
  sip: 'SIP',
  fd: 'FD',
  ppf: 'PPF',
  other: 'Other',
}

export default function InvestmentList({
  investments,
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
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-gray-500">No investments yet. Add your first investment!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Type
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                Invested
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                Current Value
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                Gain/Loss
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Date
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
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
                <tr key={investment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{investment.name}</p>
                      {investment.units && (
                        <p className="text-sm text-gray-500">
                          {investment.units} units
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {TYPE_LABELS[investment.type] || investment.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(investment.investedAmount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {investment.currentValue !== null ? (
                      formatCurrency(investment.currentValue)
                    ) : (
                      <span className="text-gray-400">-</span>
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
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(investment.purchaseDate)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onEdit(investment)}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
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
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
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
  )
}
