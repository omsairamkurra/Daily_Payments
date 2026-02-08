'use client'

import ViewModal from './ui/ViewModal'

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
  createdAt?: string
  updatedAt?: string
}

interface IncomeViewProps {
  income: IncomeEntry
  onClose: () => void
  onEdit: () => void
}

const SOURCE_COLORS: Record<string, string> = {
  Salary: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  Freelance: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Investment Returns': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  Rental: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  Business: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  Gift: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  Refund: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  Other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

export default function IncomeView({ income, onClose, onEdit }: IncomeViewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const sourceColors = SOURCE_COLORS[income.source] || SOURCE_COLORS.Other

  return (
    <ViewModal title="Income Details" onClose={onClose} onEdit={onEdit}>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Date</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {new Date(income.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Source</span>
        <span className={`px-2 py-1 text-xs font-medium rounded ${sourceColors}`}>
          {income.source}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Description</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white text-right max-w-[60%]">
          {income.description}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
        <span className="text-sm font-bold text-green-600 dark:text-green-400">
          {formatCurrency(income.amount)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Category</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {income.category ? (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded">
              {income.category}
            </span>
          ) : (
            'N/A'
          )}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Recurring</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {income.isRecurring ? (
            <span className="px-2 py-1 text-xs font-medium bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300 rounded">
              {income.frequency || 'Yes'}
            </span>
          ) : (
            'No'
          )}
        </span>
      </div>
      {income.notes && (
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Notes</span>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">
            {income.notes}
          </p>
        </div>
      )}
      {income.createdAt && (
        <div className="flex justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Created</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {new Date(income.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      )}
    </ViewModal>
  )
}
