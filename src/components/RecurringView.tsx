'use client'

import ViewModal from './ui/ViewModal'

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

interface RecurringViewProps {
  recurring: RecurringPayment
  onClose: () => void
  onEdit: () => void
}

export default function RecurringView({ recurring, onClose, onEdit }: RecurringViewProps) {
  const isOverdue = new Date(recurring.nextDueDate) <= new Date()

  return (
    <ViewModal title="Recurring Payment Details" onClose={onClose} onEdit={onEdit}>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Name</span>
        <span className="text-sm font-medium text-gray-900">{recurring.name}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Amount</span>
        <span className="text-sm font-bold text-gray-900">{'\u20B9'}{recurring.amount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Frequency</span>
        <span className="text-sm font-medium text-gray-900">{recurring.frequency}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Bank</span>
        <span className="text-sm font-medium text-gray-900">{recurring.bank || 'N/A'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Category</span>
        <span className="text-sm font-medium text-gray-900">
          {recurring.category ? (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
              {recurring.category}
            </span>
          ) : 'N/A'}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Start Date</span>
        <span className="text-sm font-medium text-gray-900">
          {new Date(recurring.startDate).toLocaleDateString()}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">Next Due Date</span>
        <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
          {new Date(recurring.nextDueDate).toLocaleDateString()}
          {isOverdue && <span className="ml-1 text-xs">(Overdue)</span>}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Status</span>
        {recurring.isActive ? (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Active</span>
        ) : (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">Inactive</span>
        )}
      </div>
      {recurring.notes && (
        <div>
          <span className="text-sm text-gray-500">Notes</span>
          <p className="text-sm text-gray-700 mt-1">{recurring.notes}</p>
        </div>
      )}
    </ViewModal>
  )
}
