'use client'

import { useSettings } from '@/lib/settings-context'

interface PortfolioKpiCardsProps {
  totalInvested: number
  totalCurrentValue: number
  overallGainLossPercent: number
  bestPerformer: { name: string; gainLossPercent: number } | null
  worstPerformer: { name: string; gainLossPercent: number } | null
}

export default function PortfolioKpiCards({
  totalInvested,
  totalCurrentValue,
  overallGainLossPercent,
  bestPerformer,
  worstPerformer,
}: PortfolioKpiCardsProps) {
  const { formatCurrency } = useSettings()

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Invested */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Invested</p>
        <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(totalInvested)}
        </p>
      </div>

      {/* Current Value */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Value</p>
        <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(totalCurrentValue)}
        </p>
      </div>

      {/* Overall Return */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Overall Return</p>
        <p
          className={`text-xl lg:text-2xl font-bold ${
            overallGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {overallGainLossPercent >= 0 ? '+' : ''}
          {overallGainLossPercent.toFixed(2)}%
        </p>
        <p
          className={`text-xs mt-1 ${
            overallGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {formatCurrency(totalCurrentValue - totalInvested)}
        </p>
      </div>

      {/* Best / Worst Performer */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Top Performers</p>
        {bestPerformer ? (
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Best</p>
              <p className="text-sm font-semibold text-green-600 truncate" title={bestPerformer.name}>
                {bestPerformer.name}
              </p>
              <p className="text-xs text-green-600">
                +{bestPerformer.gainLossPercent.toFixed(2)}%
              </p>
            </div>
            {worstPerformer && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Worst</p>
                <p
                  className={`text-sm font-semibold truncate ${
                    worstPerformer.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                  title={worstPerformer.name}
                >
                  {worstPerformer.name}
                </p>
                <p
                  className={`text-xs ${
                    worstPerformer.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {worstPerformer.gainLossPercent >= 0 ? '+' : ''}
                  {worstPerformer.gainLossPercent.toFixed(2)}%
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500">No data</p>
        )}
      </div>
    </div>
  )
}
