'use client'

interface TaxSummaryCardProps {
  totalIncome: number
  totalDeductions: number
  taxableIncome: number
  estimatedTax: number
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function TaxSummaryCard({
  totalIncome,
  totalDeductions,
  taxableIncome,
  estimatedTax,
}: TaxSummaryCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Tax Summary (New Regime 2025-26)
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gross Income */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
            Gross Income
          </p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {formatCurrency(totalIncome)}
          </p>
        </div>

        {/* Total Deductions */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
            Total Deductions
          </p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {formatCurrency(totalDeductions)}
          </p>
        </div>

        {/* Taxable Income */}
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-1">
            Taxable Income
          </p>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
            {formatCurrency(taxableIncome)}
          </p>
        </div>

        {/* Estimated Tax */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
            Estimated Tax
          </p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            {formatCurrency(estimatedTax)}
          </p>
        </div>
      </div>

      {/* Tax slabs info */}
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
          New Regime Tax Slabs (FY 2025-26)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { range: '0 - 4L', rate: '0%' },
            { range: '4L - 8L', rate: '5%' },
            { range: '8L - 12L', rate: '10%' },
            { range: '12L - 16L', rate: '15%' },
            { range: '16L - 20L', rate: '20%' },
            { range: '20L - 24L', rate: '25%' },
            { range: '> 24L', rate: '30%' },
          ].map((slab) => (
            <div
              key={slab.range}
              className="bg-gray-50 dark:bg-gray-700/50 rounded px-2 py-1.5 text-center"
            >
              <span className="text-gray-600 dark:text-gray-400">{slab.range}</span>
              <span className="ml-1 font-semibold text-gray-800 dark:text-gray-200">
                {slab.rate}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
