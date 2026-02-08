'use client'

interface IncomeEntry {
  id: string
  date: string
  source: string
  description: string
  amount: number
  category: string
  isRecurring: boolean
  frequency: string | null
  notes: string | null
}

interface IncomeListProps {
  entries: IncomeEntry[]
  onView: (entry: IncomeEntry) => void
  onEdit: (entry: IncomeEntry) => void
  onDelete: (id: string) => void
}

const SOURCE_COLORS: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  Salary: { bg: 'bg-green-100', text: 'text-green-800', darkBg: 'dark:bg-green-900', darkText: 'dark:text-green-300' },
  Freelance: { bg: 'bg-blue-100', text: 'text-blue-800', darkBg: 'dark:bg-blue-900', darkText: 'dark:text-blue-300' },
  'Investment Returns': { bg: 'bg-purple-100', text: 'text-purple-800', darkBg: 'dark:bg-purple-900', darkText: 'dark:text-purple-300' },
  Rental: { bg: 'bg-yellow-100', text: 'text-yellow-800', darkBg: 'dark:bg-yellow-900', darkText: 'dark:text-yellow-300' },
  Business: { bg: 'bg-indigo-100', text: 'text-indigo-800', darkBg: 'dark:bg-indigo-900', darkText: 'dark:text-indigo-300' },
  Gift: { bg: 'bg-pink-100', text: 'text-pink-800', darkBg: 'dark:bg-pink-900', darkText: 'dark:text-pink-300' },
  Refund: { bg: 'bg-orange-100', text: 'text-orange-800', darkBg: 'dark:bg-orange-900', darkText: 'dark:text-orange-300' },
  Other: { bg: 'bg-gray-100', text: 'text-gray-800', darkBg: 'dark:bg-gray-700', darkText: 'dark:text-gray-300' },
}

export default function IncomeList({
  entries,
  onView,
  onEdit,
  onDelete,
}: IncomeListProps) {
  const total = entries.reduce((sum, e) => sum + e.amount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getSourceColors = (source: string) => {
    return SOURCE_COLORS[source] || SOURCE_COLORS.Other
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-500 dark:text-gray-400">
        No income entries found. Add your first income to get started.
      </div>
    )
  }

  return (
    <>
      {/* Mobile card view */}
      <div className="md:hidden space-y-4">
        {entries.map((entry) => {
          const colors = getSourceColors(entry.source)
          return (
            <div
              key={entry.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 mr-2">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {entry.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(entry.date)}
                  </p>
                </div>
                <p className="text-lg font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                  {formatCurrency(entry.amount)}
                </p>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText}`}
                >
                  {entry.source}
                </span>
                {entry.category && (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                    {entry.category}
                  </span>
                )}
                {entry.isRecurring && (
                  <span className="px-2 py-1 text-xs font-medium bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300 rounded">
                    {entry.frequency || 'Recurring'}
                  </span>
                )}
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => onView(entry)}
                  className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-sm font-medium"
                >
                  View
                </button>
                <button
                  onClick={() => onEdit(entry)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this income entry?')) {
                      onDelete(entry.id)
                    }
                  }}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}

        {/* Mobile total card */}
        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg shadow-md p-4 border border-green-200 dark:border-green-800">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900 dark:text-white">Total Income</span>
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {entries.map((entry) => {
                const colors = getSourceColors(entry.source)
                return (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(entry.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText}`}
                      >
                        {entry.source}
                      </span>
                      {entry.isRecurring && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300 rounded">
                          {entry.frequency || 'Recurring'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {entry.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400 text-right">
                      {formatCurrency(entry.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {entry.category ? (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded">
                          {entry.category}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => onView(entry)}
                        className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onEdit(entry)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this income entry?')) {
                            onDelete(entry.id)
                          }
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Total
                </td>
                <td className="px-6 py-4 text-sm font-bold text-green-600 dark:text-green-400 text-right">
                  {formatCurrency(total)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  )
}
