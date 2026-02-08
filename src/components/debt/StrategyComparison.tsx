'use client'

import { useMemo } from 'react'
import { calculateAvalanchePayoff, calculateSnowballPayoff } from '@/lib/financial-math'

interface StrategyComparisonProps {
  loans: Array<{ id: string; remainingAmount: number; interestRate: number; emiAmount: number }>
  extraMonthly: number
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function StrategyComparison({ loans, extraMonthly }: StrategyComparisonProps) {
  const { avalanche, snowball, recommended } = useMemo(() => {
    if (loans.length === 0) {
      return {
        avalanche: { totalInterest: 0, months: 0 },
        snowball: { totalInterest: 0, months: 0 },
        recommended: 'avalanche' as const,
      }
    }

    const avalancheResult = calculateAvalanchePayoff(loans, extraMonthly)
    const snowballResult = calculateSnowballPayoff(loans, extraMonthly)

    const rec = avalancheResult.totalInterest <= snowballResult.totalInterest
      ? 'avalanche' as const
      : 'snowball' as const

    return {
      avalanche: avalancheResult,
      snowball: snowballResult,
      recommended: rec,
    }
  }, [loans, extraMonthly])

  const interestDiff = Math.abs(avalanche.totalInterest - snowball.totalInterest)
  const monthsDiff = Math.abs(avalanche.months - snowball.months)

  const strategies = [
    {
      key: 'avalanche' as const,
      name: 'Avalanche Strategy',
      description: 'Pay off highest interest rate first. Minimizes total interest paid.',
      totalInterest: avalanche.totalInterest,
      months: avalanche.months,
      savingsVsOther: recommended === 'avalanche' ? interestDiff : 0,
      monthsSavedVsOther: recommended === 'avalanche' ? monthsDiff : 0,
      accentColor: 'blue',
    },
    {
      key: 'snowball' as const,
      name: 'Snowball Strategy',
      description: 'Pay off smallest balance first. Builds momentum with quick wins.',
      totalInterest: snowball.totalInterest,
      months: snowball.months,
      savingsVsOther: recommended === 'snowball' ? interestDiff : 0,
      monthsSavedVsOther: recommended === 'snowball' ? monthsDiff : 0,
      accentColor: 'orange',
    },
  ]

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Strategy Comparison
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strategies.map((strategy) => {
          const isRecommended = recommended === strategy.key
          const borderColor = isRecommended
            ? 'border-green-400 dark:border-green-500'
            : 'border-gray-200 dark:border-gray-700'

          return (
            <div
              key={strategy.key}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 ${borderColor} p-5 relative`}
            >
              {isRecommended && (
                <span className="absolute top-3 right-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                  Recommended
                </span>
              )}

              <h3 className={`text-base font-bold mb-1 ${
                strategy.accentColor === 'blue'
                  ? 'text-blue-700 dark:text-blue-400'
                  : 'text-orange-700 dark:text-orange-400'
              }`}>
                {strategy.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                {strategy.description}
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Interest</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(strategy.totalInterest)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Months to Payoff</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {strategy.months} months
                  </span>
                </div>

                {isRecommended && interestDiff > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        You save
                      </span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(interestDiff)}
                      </span>
                    </div>
                    {monthsDiff > 0 && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          Faster by
                        </span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          {monthsDiff} months
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
