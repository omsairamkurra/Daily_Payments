'use client'

interface Subscription {
  id: string
  name: string
  amount: number
  frequency: string
  category: string
  provider: string
  startDate: string
  nextRenewalDate: string
  isActive: boolean
  lastUsedDate: string | null
  autoDetected: boolean
}

interface SubscriptionListProps {
  subscriptions: Subscription[]
  onView: (subscription: Subscription) => void
  onEdit: (subscription: Subscription) => void
  onDelete: (id: string) => void
}

export default function SubscriptionList({
  subscriptions,
  onView,
  onEdit,
  onDelete,
}: SubscriptionListProps) {
  const isOverdue = (dateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const renewalDate = new Date(dateStr)
    renewalDate.setHours(0, 0, 0, 0)
    return renewalDate < today
  }

  const isWithin7Days = (dateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const renewalDate = new Date(dateStr)
    renewalDate.setHours(0, 0, 0, 0)
    const diffDays = (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays >= 0 && diffDays <= 7
  }

  const isZombie = (sub: Subscription) => {
    if (!sub.isActive || !sub.lastUsedDate) return false
    const lastUsed = new Date(sub.lastUsedDate)
    const today = new Date()
    const diffDays = (today.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays > 60
  }

  const getRenewalDateClasses = (dateStr: string) => {
    if (isOverdue(dateStr)) return 'text-red-600 dark:text-red-400 font-semibold'
    if (isWithin7Days(dateStr)) return 'text-orange-600 dark:text-orange-400 font-semibold'
    return 'text-gray-900 dark:text-gray-100'
  }

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-500 dark:text-gray-400">
        No subscriptions yet. Add your first subscription!
      </div>
    )
  }

  return (
    <>
      {/* Mobile card view */}
      <div className="md:hidden space-y-4">
        {subscriptions.map((item) => (
          <div
            key={item.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${
              isOverdue(item.nextRenewalDate)
                ? 'border-l-4 border-red-500'
                : isWithin7Days(item.nextRenewalDate)
                ? 'border-l-4 border-orange-500'
                : ''
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {item.name}
                </h3>
                {isZombie(item) && (
                  <span title="Unused for 60+ days" className="text-orange-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {'\u20B9'}{item.amount.toFixed(2)}
              </span>
            </div>
            <div className="space-y-1 text-sm mb-3">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Frequency</span>
                <span className="text-gray-900 dark:text-gray-100">{item.frequency}</span>
              </div>
              {item.category && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Category</span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                    {item.category}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Next Renewal</span>
                <span className={getRenewalDateClasses(item.nextRenewalDate)}>
                  {new Date(item.nextRenewalDate).toLocaleDateString()}
                  {isOverdue(item.nextRenewalDate) && ' (Overdue)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                {item.isActive ? (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded">
                    Inactive
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => onView(item)}
                className="flex-1 px-3 py-1.5 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors font-medium"
              >
                View
              </button>
              <button
                onClick={() => onEdit(item)}
                className="flex-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this subscription?')) {
                    onDelete(item.id)
                  }
                }}
                className="flex-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Next Renewal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {subscriptions.map((item) => (
                <tr
                  key={item.id}
                  className={
                    isOverdue(item.nextRenewalDate)
                      ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                      : isWithin7Days(item.nextRenewalDate)
                      ? 'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-2">
                      {item.name}
                      {isZombie(item) && (
                        <span title="Unused for 60+ days" className="text-orange-500">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">
                    {'\u20B9'}{item.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {item.frequency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.category ? (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                        {item.category}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${getRenewalDateClasses(item.nextRenewalDate)}`}>
                    {new Date(item.nextRenewalDate).toLocaleDateString()}
                    {isOverdue(item.nextRenewalDate) && (
                      <span className="ml-1 text-xs">(Overdue)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.isActive ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => onView(item)}
                      className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this subscription?')) {
                          onDelete(item.id)
                        }
                      }}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
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
    </>
  )
}
