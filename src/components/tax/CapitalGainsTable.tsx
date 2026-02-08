'use client'

interface CapitalGainsTableProps {
  shortTerm: Array<{ name: string; invested: number; sold: number; gain: number }>
  longTerm: Array<{ name: string; invested: number; sold: number; gain: number }>
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function GainsSection({
  title,
  items,
}: {
  title: string
  items: Array<{ name: string; invested: number; sold: number; gain: number }>
}) {
  const totalGain = items.reduce((sum, item) => sum + item.gain, 0)

  return (
    <div className="mb-6 last:mb-0">
      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
        {title}
      </h4>
      {items.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400 font-medium">
                  Investment
                </th>
                <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-400 font-medium">
                  Invested
                </th>
                <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-400 font-medium">
                  Current/Sold
                </th>
                <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-400 font-medium">
                  Gain/Loss
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                >
                  <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                    {item.name}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">
                    {formatCurrency(item.invested)}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">
                    {formatCurrency(item.sold)}
                  </td>
                  <td
                    className={`py-2 px-3 text-right font-semibold ${
                      item.gain >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {item.gain >= 0 ? '+' : ''}
                    {formatCurrency(item.gain)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                <td
                  colSpan={3}
                  className="py-2 px-3 text-right font-semibold text-gray-800 dark:text-gray-200"
                >
                  Total
                </td>
                <td
                  className={`py-2 px-3 text-right font-bold ${
                    totalGain >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {totalGain >= 0 ? '+' : ''}
                  {formatCurrency(totalGain)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-2">
          No {title.toLowerCase()} recorded.
        </p>
      )}
    </div>
  )
}

export default function CapitalGainsTable({ shortTerm, longTerm }: CapitalGainsTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Capital Gains
      </h3>

      <GainsSection title="Short-Term Capital Gains (STCG)" items={shortTerm} />
      <GainsSection title="Long-Term Capital Gains (LTCG)" items={longTerm} />
    </div>
  )
}
