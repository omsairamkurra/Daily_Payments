'use client'

interface Payment {
  id: string
  date: string
  description: string
  amount: number
  location: string | null
  bank: string
  category: string
}

interface PaymentListProps {
  payments: Payment[]
  onView: (payment: Payment) => void
  onEdit: (payment: Payment) => void
  onDelete: (id: string) => void
}

export default function PaymentList({
  payments,
  onView,
  onEdit,
  onDelete,
}: PaymentListProps) {
  const total = payments.reduce((sum, p) => sum + p.amount, 0)

  if (payments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-500 dark:text-gray-400">
        No payments found. Add your first payment to get started.
      </div>
    )
  }

  return (
    <div>
      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {payments.map((payment) => (
          <div key={payment.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0 mr-3">
                <p className="font-medium text-gray-900 dark:text-white truncate">{payment.description}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(payment.date).toLocaleDateString()} &middot; {payment.bank || 'N/A'}
                </p>
                {payment.category && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                    {payment.category}
                  </span>
                )}
              </div>
              <p className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                ₹{payment.amount.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => onView(payment)} className="text-green-600 text-sm">View</button>
              <button onClick={() => onEdit(payment)} className="text-blue-600 text-sm">Edit</button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this payment?')) {
                    onDelete(payment.id)
                  }
                }}
                className="text-red-600 text-sm"
              >
                Delete
              </button>
              {payment.location && (
                <a
                  href={`https://www.google.com/maps?q=${payment.location}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm ml-auto"
                >
                  Map
                </a>
              )}
            </div>
          </div>
        ))}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex justify-between">
          <span className="font-semibold text-gray-900 dark:text-white">Total</span>
          <span className="font-semibold text-gray-900 dark:text-white">₹{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Bank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {payment.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                      ₹{payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {payment.bank || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment.category ? (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                          {payment.category}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {payment.location ? (
                        <a
                          href={`https://www.google.com/maps?q=${payment.location}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Map
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => onView(payment)}
                        className="text-green-600 hover:text-green-800 mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onEdit(payment)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this payment?')) {
                            onDelete(payment.id)
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
              <tfoot className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Total
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white text-right">
                    ₹{total.toFixed(2)}
                  </td>
                  <td colSpan={4}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
