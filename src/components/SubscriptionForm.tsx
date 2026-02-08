'use client'

import { useState, useEffect } from 'react'
import Spinner from './ui/Spinner'

const PROVIDER_PRESETS = [
  { name: 'Netflix', category: 'Entertainment', provider: 'Netflix' },
  { name: 'Spotify', category: 'Music', provider: 'Spotify' },
  { name: 'YouTube Premium', category: 'Entertainment', provider: 'Google' },
  { name: 'Amazon Prime', category: 'Entertainment', provider: 'Amazon' },
  { name: 'Disney+', category: 'Entertainment', provider: 'Disney' },
  { name: 'Hotstar', category: 'Entertainment', provider: 'Disney' },
  { name: 'JioCinema', category: 'Entertainment', provider: 'Jio' },
  { name: 'Swiggy One', category: 'Food Delivery', provider: 'Swiggy' },
  { name: 'Zomato Gold', category: 'Food Delivery', provider: 'Zomato' },
  { name: 'iCloud', category: 'Cloud Storage', provider: 'Apple' },
  { name: 'Google One', category: 'Cloud Storage', provider: 'Google' },
  { name: 'ChatGPT Plus', category: 'Productivity', provider: 'OpenAI' },
]

const CATEGORIES = [
  'Entertainment',
  'Music',
  'Cloud Storage',
  'Food Delivery',
  'Productivity',
  'Health',
  'News',
  'Other',
]

const FREQUENCIES = ['Monthly', 'Quarterly', 'Yearly']

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

interface SubscriptionFormProps {
  subscription?: Subscription | null
  onSubmit: (data: Omit<Subscription, 'id' | 'autoDetected'>) => void | Promise<void>
  onCancel: () => void
}

export default function SubscriptionForm({
  subscription,
  onSubmit,
  onCancel,
}: SubscriptionFormProps) {
  const [name, setName] = useState(subscription?.name || '')
  const [amount, setAmount] = useState(subscription?.amount?.toString() || '')
  const [frequency, setFrequency] = useState(subscription?.frequency || 'Monthly')
  const [category, setCategory] = useState(subscription?.category || '')
  const [provider, setProvider] = useState(subscription?.provider || '')
  const [startDate, setStartDate] = useState(
    subscription?.startDate
      ? new Date(subscription.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [nextRenewalDate, setNextRenewalDate] = useState(
    subscription?.nextRenewalDate
      ? new Date(subscription.nextRenewalDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [isActive, setIsActive] = useState(
    subscription?.isActive !== undefined ? subscription.isActive : true
  )
  const [lastUsedDate, setLastUsedDate] = useState(
    subscription?.lastUsedDate
      ? new Date(subscription.lastUsedDate).toISOString().split('T')[0]
      : ''
  )
  const [selectedPreset, setSelectedPreset] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (selectedPreset && selectedPreset !== 'Other') {
      const preset = PROVIDER_PRESETS.find((p) => p.name === selectedPreset)
      if (preset) {
        setName(preset.name)
        setCategory(preset.category)
        setProvider(preset.provider)
      }
    } else if (selectedPreset === 'Other') {
      setName('')
      setCategory('')
      setProvider('')
    }
  }, [selectedPreset])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await onSubmit({
        name,
        amount: parseFloat(amount),
        frequency,
        category,
        provider,
        startDate,
        nextRenewalDate,
        isActive,
        lastUsedDate: lastUsedDate || null,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {subscription ? 'Edit Subscription' : 'Add Subscription'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Provider Preset */}
          {!subscription && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quick Select
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Choose a service...</option>
                {PROVIDER_PRESETS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Subscription name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount ({'\u20B9'})
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select Category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Provider
            </label>
            <input
              type="text"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="e.g., Netflix, Google"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Next Renewal Date
            </label>
            <input
              type="date"
              value={nextRenewalDate}
              onChange={(e) => setNextRenewalDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Used Date (optional)
            </label>
            <input
              type="date"
              value={lastUsedDate}
              onChange={(e) => setLastUsedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Spinner size="sm" className="text-white" />}
              {subscription ? 'Update' : 'Add'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
