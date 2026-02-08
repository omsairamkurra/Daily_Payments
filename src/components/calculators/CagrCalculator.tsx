'use client'

import { useState, useMemo } from 'react'
import { calculateCAGR } from '@/lib/financial-math'
import { useSettings } from '@/lib/settings-context'
import ReturnProjectionChart from './ReturnProjectionChart'

export default function CagrCalculator() {
  const { formatCurrency } = useSettings()
  const [initialValue, setInitialValue] = useState(100000)
  const [finalValue, setFinalValue] = useState(300000)
  const [years, setYears] = useState(5)

  const results = useMemo(() => {
    const cagr = calculateCAGR(initialValue, finalValue, years)
    const totalGainAmount = finalValue - initialValue
    const totalGainPercent = initialValue > 0 ? ((finalValue - initialValue) / initialValue) * 100 : 0
    return { cagr, totalGainAmount, totalGainPercent }
  }, [initialValue, finalValue, years])

  // Generate scenarios around the calculated CAGR
  const scenarios = useMemo(() => {
    const cagr = results.cagr
    if (cagr <= 0) return [8, 12, 15]
    const base = Math.round(cagr)
    return [
      Math.max(1, base - 4),
      base,
      Math.min(30, base + 4),
    ]
  }, [results.cagr])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Inputs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">CAGR Calculator</h3>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Initial Investment Value
            </label>
            <input
              type="number"
              min={1}
              value={initialValue}
              onChange={(e) => setInitialValue(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Final Investment Value
            </label>
            <input
              type="number"
              min={1}
              value={finalValue}
              onChange={(e) => setFinalValue(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time Period: <span className="font-bold text-blue-600 dark:text-blue-400">{years} years</span>
            </label>
            <input
              type="range"
              min={1}
              max={40}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1 yr</span>
              <span>40 yrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results + Chart */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">CAGR</p>
            <p className="text-xl font-bold text-blue-800 dark:text-blue-200 mt-1">
              {results.cagr.toFixed(2)}%
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Gain</p>
            <p className="text-xl font-bold text-green-800 dark:text-green-200 mt-1">
              {formatCurrency(Math.round(results.totalGainAmount))}
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Gain %</p>
            <p className="text-xl font-bold text-purple-800 dark:text-purple-200 mt-1">
              {results.totalGainPercent.toFixed(2)}%
            </p>
          </div>
        </div>

        <ReturnProjectionChart
          initialAmount={initialValue}
          years={years}
          scenarios={scenarios}
        />
      </div>
    </div>
  )
}
