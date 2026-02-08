'use client'

interface RecurringPayment {
  id: string
  name: string
  amount: number
  frequency: string
  bank: string
  category: string
  startDate: string
  nextDueDate: string
  isActive: boolean
  notes: string | null
}

interface RecurringListProps {
  recurring: RecurringPayment[]
  onView: (recurring: RecurringPayment) => void
  onEdit: (recurring: RecurringPayment) => void
  onDelete: (id: string) => void
}

export default function RecurringList({
  recurring,
  onView,
  onEdit,
  onDelete,
}: RecurringListProps) {
  if (recurring.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-500 dark:text-gray-400">
        No recurring payments yet.
      </div>
    )
  }

  const isOverdue = (dateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(dateStr)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate <= today
  }

  return (
    <div>
      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {recurring.map((item) => (
          <div
            key={item.id}
            className={`rounded-lg shadow-md p-4 ${
              isOverdue(item.nextDueDate)
                ? 'bg-red-50 dark:bg-red-900/20'
                : 'bg-white dark:bg-gray-800'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0 mr-3">
                <p className="font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.frequency} &middot; {item.bank || 'N/A'}
                </p>
                <div className="flex gap-2 mt-1">
                  {item.category && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                      {item.category}
                    </span>
                  )}
                  {item.isActive ? (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                  {'\u20B9'}{item.amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Due: {new Date(item.nextDueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => onView(item)} className="text-green-600 text-sm">View</button>
              <button onClick={() => onEdit(item)} className="text-blue-600 text-sm">Edit</button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this recurring payment?')) {
                    onDelete(item.id)
                  }
                }}
                className="text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Bank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Next Due
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recurring.map((item) => (
                  <tr
                    key={item.id}
                    className={
                      isOverdue(item.nextDueDate)
                        ? 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                      {'\u20B9'}{item.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.frequency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.bank || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.category ? (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                          {item.category}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(item.nextDueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.isActive ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => onView(item)}
                        className="text-green-600 hover:text-green-800 mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this recurring payment?')) {
                            onDelete(item.id)
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
