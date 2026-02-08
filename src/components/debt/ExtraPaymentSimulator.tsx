'use client'

import { useMemo } from 'react'
import { calculateAvalanchePayoff } from '@/lib/financial-math'

interface ExtraPaymentSimulatorProps {
  loans: Array<{ id: string; remainingAmount: number; interestRate: number; emiAmount: number }>
  onExtraChange: (extra: number) => void
  extraMonthly: number
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ExtraPaymentSimulator({
  loans,
  onExtraChange,
  extraMonthly,
}: ExtraPaymentSimulatorProps) {
  const { savings, monthsSaved } = useMemo(() => {
    if (loans.length === 0) {
      return { savings: 0, monthsSaved: 0 }
    }

    const baseline = calculateAvalanchePayoff(loans, 0)
    const withExtra = calculateAvalanchePayoff(loans, extraMonthly)

    return {
      savings: Math.max(0, baseline.totalInterest - withExtra.totalInterest),
      monthsSaved: Math.max(0, baseline.months - withExtra.months),
    }
  }, [loans, extraMonthly])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
        Extra Payment Simulator
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        See how extra monthly payments accelerate your debt payoff
      </p>

      <div className="space-y-4">
        {/* Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Extra Monthly Payment
            </label>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(extraMonthly)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={50000}
            step={500}
            value={extraMonthly}
            onChange={(e) => onExtraChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
            <span>0</span>
            <span>12,500</span>
            <span>25,000</span>
            <span>37,500</span>
            <span>50,000</span>
          </div>
        </div>

        {/* Results */}
        {extraMonthly > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-green-700 dark:text-green-300">
                  You save <span className="font-bold">{formatCurrency(savings)}</span> in interest
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-green-700 dark:text-green-300">
                  Pay off <span className="font-bold">{monthsSaved} months</span> earlier
                </span>
              </div>
            </div>
          </div>
        )}

        {extraMonthly === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">
            Move the slider to see how extra payments can save you money
          </p>
        )}
      </div>
    </div>
  )
}
