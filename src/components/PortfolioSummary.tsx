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

interface PortfolioSummaryProps {
  investments: Investment[]
}

export default function PortfolioSummary({ investments }: PortfolioSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const totalInvested = investments.reduce(
    (sum, inv) => sum + inv.investedAmount,
    0
  )

  const investmentsWithValue = investments.filter(
    (inv) => inv.currentValue !== null
  )

  const totalCurrentValue = investmentsWithValue.reduce(
    (sum, inv) => sum + (inv.currentValue || 0),
    0
  )

  const investedWithValue = investmentsWithValue.reduce(
    (sum, inv) => sum + inv.investedAmount,
    0
  )

  const totalGainLoss = totalCurrentValue - investedWithValue
  const totalGainLossPercentage =
    investedWithValue > 0 ? (totalGainLoss / investedWithValue) * 100 : 0

  const hasValueData = investmentsWithValue.length > 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-sm text-gray-500 mb-1">Total Invested</p>
        <p className="text-2xl font-bold text-gray-900">
          {formatCurrency(totalInvested)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {investments.length} investment{investments.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-sm text-gray-500 mb-1">Current Value</p>
        {hasValueData ? (
          <>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalCurrentValue)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Based on {investmentsWithValue.length} investment
              {investmentsWithValue.length !== 1 ? 's' : ''} with value data
            </p>
          </>
        ) : (
          <p className="text-xl text-gray-400">No value data</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-sm text-gray-500 mb-1">Total Gain/Loss</p>
        {hasValueData ? (
          <>
            <p
              className={`text-2xl font-bold ${
                totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {totalGainLoss >= 0 ? '+' : ''}
              {formatCurrency(totalGainLoss)}
            </p>
            <p
              className={`text-sm mt-1 ${
                totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {totalGainLossPercentage >= 0 ? '+' : ''}
              {totalGainLossPercentage.toFixed(2)}%
            </p>
          </>
        ) : (
          <p className="text-xl text-gray-400">No value data</p>
        )}
      </div>
    </div>
  )
}
