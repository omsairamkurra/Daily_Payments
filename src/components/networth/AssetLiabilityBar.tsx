'use client'

interface AssetLiabilityBarProps {
  assets: number
  liabilities: number
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function AssetLiabilityBar({ assets, liabilities }: AssetLiabilityBarProps) {
  const total = assets + liabilities
  const assetsPercent = total > 0 ? (assets / total) * 100 : 50
  const liabilitiesPercent = total > 0 ? (liabilities / total) * 100 : 50

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Assets vs Liabilities
      </h3>

      <div className="space-y-4">
        {/* Stacked bar */}
        <div className="relative h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex">
          {assets > 0 && (
            <div
              className="h-full bg-green-500 transition-all duration-500 flex items-center justify-center"
              style={{ width: `${assetsPercent}%` }}
            >
              {assetsPercent > 20 && (
                <span className="text-white text-xs font-semibold px-2 truncate">
                  {assetsPercent.toFixed(0)}%
                </span>
              )}
            </div>
          )}
          {liabilities > 0 && (
            <div
              className="h-full bg-red-500 transition-all duration-500 flex items-center justify-center"
              style={{ width: `${liabilitiesPercent}%` }}
            >
              {liabilitiesPercent > 20 && (
                <span className="text-white text-xs font-semibold px-2 truncate">
                  {liabilitiesPercent.toFixed(0)}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Labels */}
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Assets
              </p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(assets)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-right">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Liabilities
              </p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {formatCurrency(liabilities)}
              </p>
            </div>
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
