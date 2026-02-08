'use client'

interface AllocationRow {
  name: string
  value: number
  percentage: number
  recommended: number
}

interface AssetAllocationTableProps {
  allocation: AllocationRow[]
}

export default function AssetAllocationTable({
  allocation,
}: AssetAllocationTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getDeviationColor = (current: number, recommended: number) => {
    const diff = Math.abs(current - recommended)
    if (diff <= 5) return 'text-green-600 dark:text-green-400'
    if (diff <= 15) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getDeviationIndicator = (current: number, recommended: number) => {
    const diff = current - recommended
    if (Math.abs(diff) <= 5) return null
    if (diff > 0) {
      return (
        <span className="text-orange-600 dark:text-orange-400 text-xs ml-1" title="Over-allocated">
          (+{diff.toFixed(1)}%)
        </span>
      )
    }
    return (
      <span className="text-blue-600 dark:text-blue-400 text-xs ml-1" title="Under-allocated">
        ({diff.toFixed(1)}%)
      </span>
    )
  }

  if (!allocation || allocation.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Allocation Breakdown
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No allocation data available.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="p-6 pb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Allocation Breakdown
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Current %
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Recommended %
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {allocation.map((row) => (
              <tr
                key={row.name}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {row.name}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-700 dark:text-gray-300 font-medium">
                  {formatCurrency(row.value)}
                </td>
                <td
                  className={`px-6 py-4 text-sm text-right font-medium ${getDeviationColor(
                    row.percentage,
                    row.recommended
                  )}`}
                >
                  {row.percentage.toFixed(1)}%
                  {getDeviationIndicator(row.percentage, row.recommended)}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-500 dark:text-gray-400">
                  {row.recommended.toFixed(0)}%
                </td>
                <td className="px-6 py-4 text-center">
                  {Math.abs(row.percentage - row.recommended) <= 5 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      On Track
                    </span>
                  ) : row.percentage > row.recommended ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                      Over
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      Under
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
