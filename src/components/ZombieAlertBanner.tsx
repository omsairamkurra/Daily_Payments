'use client'

import { useState } from 'react'

interface Subscription {
  id: string
  name: string
  amount: number
  frequency: string
  isActive: boolean
  lastUsedDate: string | null
}

interface ZombieAlertBannerProps {
  subscriptions: Subscription[]
}

export default function ZombieAlertBanner({ subscriptions }: ZombieAlertBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  const zombieSubscriptions = subscriptions.filter((s) => {
    if (!s.isActive || !s.lastUsedDate) return false
    const lastUsed = new Date(s.lastUsedDate)
    const today = new Date()
    const diffDays = (today.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays > 60
  })

  // Calculate monthly cost of zombie subscriptions
  const zombieMonthlyCost = zombieSubscriptions.reduce((sum, s) => {
    if (s.frequency === 'Monthly') return sum + s.amount
    if (s.frequency === 'Quarterly') return sum + s.amount / 3
    if (s.frequency === 'Yearly') return sum + s.amount / 12
    return sum
  }, 0)

  if (dismissed || zombieSubscriptions.length === 0) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-200">
            You have {zombieSubscriptions.length} unused subscription{zombieSubscriptions.length !== 1 ? 's' : ''} costing {formatCurrency(zombieMonthlyCost)}/month
          </h3>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-orange-400 dark:text-orange-500 hover:text-orange-600 dark:hover:text-orange-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
        These subscriptions have not been used in over 60 days. Consider cancelling them to save money.
      </p>
      <div className="space-y-2">
        {zombieSubscriptions.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg"
          >
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last used: {s.lastUsedDate ? new Date(s.lastUsedDate).toLocaleDateString() : 'Never'}
              </p>
            </div>
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              {'\u20B9'}{s.amount.toFixed(2)}/{s.frequency === 'Monthly' ? 'mo' : s.frequency === 'Quarterly' ? 'qtr' : 'yr'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
