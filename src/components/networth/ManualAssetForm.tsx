'use client'

import { useState } from 'react'
import Spinner from '../ui/Spinner'

interface ManualAsset {
  id: string
  name: string
  category: string
  estimatedValue: number
  purchaseDate: string | null
  notes: string | null
}

interface ManualAssetFormProps {
  asset?: ManualAsset | null
  onSubmit: (data: {
    name: string
    category: string
    estimatedValue: number
    purchaseDate: string | null
    notes: string | null
  }) => void | Promise<void>
  onCancel: () => void
}

const ASSET_CATEGORIES = [
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
]

export default function ManualAssetForm({
  asset,
  onSubmit,
  onCancel,
}: ManualAssetFormProps) {
  const [name, setName] = useState(asset?.name || '')
  const [category, setCategory] = useState(asset?.category || 'other')
  const [estimatedValue, setEstimatedValue] = useState(
    asset?.estimatedValue?.toString() || ''
  )
  const [purchaseDate, setPurchaseDate] = useState(
    asset?.purchaseDate
      ? new Date(asset.purchaseDate).toISOString().split('T')[0]
      : ''
  )
  const [notes, setNotes] = useState(asset?.notes || '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit({
        name,
        category,
        estimatedValue: parseFloat(estimatedValue),
        purchaseDate: purchaseDate || null,
        notes: notes || null,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {asset ? 'Edit Asset' : 'Add Asset'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Apartment in Hyderabad"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
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
              {ASSET_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estimated Value (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Purchase Date (optional)
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Spinner size="sm" className="text-white" />}
              {asset ? 'Update' : 'Add'}
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
