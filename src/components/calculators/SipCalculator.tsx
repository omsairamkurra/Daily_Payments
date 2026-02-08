'use client'

import { useState, useMemo } from 'react'
import { calculateSIPMaturity } from '@/lib/financial-math'
import { useSettings } from '@/lib/settings-context'
import ComparisonChart from './ComparisonChart'

export default function SipCalculator() {
  const { formatCurrency } = useSettings()
  const [monthlyAmount, setMonthlyAmount] = useState(5000)
  const [years, setYears] = useState(10)
  const [returnPercent, setReturnPercent] = useState(12)

  const results = useMemo(() => {
    const totalInvested = monthlyAmount * years * 12
    const maturityValue = calculateSIPMaturity(monthlyAmount, years, returnPercent)
    const totalReturns = maturityValue - totalInvested
    return { totalInvested, maturityValue, totalReturns }
  }, [monthlyAmount, years, returnPercent])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Inputs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">SIP Calculator</h3>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Monthly Investment Amount
            </label>
            <input
              type="number"
              min={100}
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Investment Period: <span className="font-bold text-blue-600 dark:text-blue-400">{years} years</span>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Expected Annual Return: <span className="font-bold text-blue-600 dark:text-blue-400">{returnPercent}%</span>
            </label>
            <input
              type="range"
              min={1}
              max={30}
              value={returnPercent}
              onChange={(e) => setReturnPercent(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1%</span>
              <span>30%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results + Chart */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Invested</p>
            <p className="text-xl font-bold text-blue-800 dark:text-blue-200 mt-1">
              {formatCurrency(Math.round(results.totalInvested))}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Maturity Value</p>
            <p className="text-xl font-bold text-green-800 dark:text-green-200 mt-1">
              {formatCurrency(Math.round(results.maturityValue))}
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Returns</p>
            <p className="text-xl font-bold text-purple-800 dark:text-purple-200 mt-1">
              {formatCurrency(Math.round(results.totalReturns))}
            </p>
          </div>
        </div>

        <ComparisonChart
          sipMonthly={monthlyAmount}
          lumpSumAmount={monthlyAmount * years * 12}
          years={years}
          returnPercent={returnPercent}
        />
      </div>
    </div>
  )
}
