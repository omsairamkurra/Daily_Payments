'use client'

interface Subscription {
  id: string
  name: string
  amount: number
  frequency: string
  isActive: boolean
}

interface SubscriptionSummaryCardProps {
  subscriptions: Subscription[]
}

export default function SubscriptionSummaryCard({ subscriptions }: SubscriptionSummaryCardProps) {
  const activeSubscriptions = subscriptions.filter((s) => s.isActive)

  const monthlyTotal = activeSubscriptions
    .filter((s) => s.frequency === 'Monthly')
    .reduce((sum, s) => sum + s.amount, 0)

  const quarterlyTotal = activeSubscriptions
    .filter((s) => s.frequency === 'Quarterly')
    .reduce((sum, s) => sum + s.amount, 0)

  const yearlyTotal = activeSubscriptions
    .filter((s) => s.frequency === 'Yearly')
    .reduce((sum, s) => sum + s.amount, 0)

  // Monthly cost = monthly subs + quarterly/3 + yearly/12
  const effectiveMonthly = monthlyTotal + quarterlyTotal / 3 + yearlyTotal / 12

  // Yearly projection = monthly * 12 + quarterly * 4 + yearly * 1
  const yearlyProjection = monthlyTotal * 12 + quarterlyTotal * 4 + yearlyTotal

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Subscription Summary
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monthly Cost</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(effectiveMonthly)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">effective per month</p>
        </div>
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Yearly Projection</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(yearlyProjection)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">total per year</p>
        </div>
        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Active Subscriptions</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {activeSubscriptions.length}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            of {subscriptions.length} total
          </p>
        </div>
      </div>
    </div>
  )
}
