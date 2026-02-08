'use client'

import ViewModal from './ui/ViewModal'

interface Payment {
  id: string
  date: string
  description: string
  amount: number
  location: string | null
  bank: string
  category: string
}

interface PaymentViewProps {
  payment: Payment
  onClose: () => void
  onEdit: () => void
}

export default function PaymentView({ payment, onClose, onEdit }: PaymentViewProps) {
  return (
    <ViewModal title="Payment Details" onClose={onClose} onEdit={onEdit}>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Date</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {new Date(payment.date).toLocaleDateString()}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Description</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{payment.description}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">{'\u20B9'}{payment.amount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Bank</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{payment.bank || 'N/A'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Category</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {payment.category ? (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
              {payment.category}
            </span>
          ) : 'N/A'}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Location</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {payment.location ? (
            <a
              href={`https://www.google.com/maps?q=${payment.location}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Map
            </a>
          ) : 'N/A'}
        </span>
      </div>
    </ViewModal>
  )
}
