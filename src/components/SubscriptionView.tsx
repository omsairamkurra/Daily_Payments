'use client'

import ViewModal from './ui/ViewModal'

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

interface SubscriptionViewProps {
  subscription: Subscription
  onClose: () => void
  onEdit: () => void
}

export default function SubscriptionView({ subscription, onClose, onEdit }: SubscriptionViewProps) {
  const isOverdue = new Date(subscription.nextRenewalDate) < new Date()
  const isWithin7Days = (() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const renewalDate = new Date(subscription.nextRenewalDate)
    renewalDate.setHours(0, 0, 0, 0)
    const diffDays = (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays >= 0 && diffDays <= 7
  })()

  const isZombie = (() => {
    if (!subscription.isActive || !subscription.lastUsedDate) return false
    const lastUsed = new Date(subscription.lastUsedDate)
    const today = new Date()
    const diffDays = (today.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays > 60
  })()

  return (
    <ViewModal title="Subscription Details" onClose={onClose} onEdit={onEdit}>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Name</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{subscription.name}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {'\u20B9'}{subscription.amount.toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Frequency</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{subscription.frequency}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Category</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {subscription.category ? (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
              {subscription.category}
            </span>
          ) : 'N/A'}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Provider</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {subscription.provider || 'N/A'}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Start Date</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {new Date(subscription.startDate).toLocaleDateString()}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">Next Renewal</span>
        <span className={`text-sm font-medium ${
          isOverdue
            ? 'text-red-600 dark:text-red-400'
            : isWithin7Days
            ? 'text-orange-600 dark:text-orange-400'
            : 'text-gray-900 dark:text-white'
        }`}>
          {new Date(subscription.nextRenewalDate).toLocaleDateString()}
          {isOverdue && <span className="ml-1 text-xs">(Overdue)</span>}
          {isWithin7Days && !isOverdue && <span className="ml-1 text-xs">(Soon)</span>}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
        <div className="flex items-center gap-2">
          {subscription.isActive ? (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
              Active
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded">
              Inactive
            </span>
          )}
          {isZombie && (
            <span className="px-2 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded">
              Unused 60+ days
            </span>
          )}
        </div>
      </div>
      {subscription.lastUsedDate && (
        <div className="flex justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Last Used</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {new Date(subscription.lastUsedDate).toLocaleDateString()}
          </span>
        </div>
      )}
      {subscription.autoDetected && (
        <div className="flex justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Source</span>
          <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
            Auto-detected
          </span>
        </div>
      )}
    </ViewModal>
  )
}
