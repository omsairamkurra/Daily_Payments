'use client'

import { useState } from 'react'
import Spinner from './ui/Spinner'

interface Goal {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
  deadline: string | null
  notes: string | null
}

interface GoalFormProps {
  goal?: Goal | null
  onSubmit: (data: {
    name: string
    targetAmount: number
    savedAmount: number
    deadline: string | null
    notes: string | null
  }) => void | Promise<void>
  onCancel: () => void
}

export default function GoalForm({
  goal,
  onSubmit,
  onCancel,
}: GoalFormProps) {
  const [name, setName] = useState(goal?.name || '')
  const [targetAmount, setTargetAmount] = useState(
    goal?.targetAmount?.toString() || ''
  )
  const [savedAmount, setSavedAmount] = useState(
    goal?.savedAmount?.toString() || '0'
  )
  const [deadline, setDeadline] = useState(
    goal?.deadline
      ? new Date(goal.deadline).toISOString().split('T')[0]
      : ''
  )
  const [notes, setNotes] = useState(goal?.notes || '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await onSubmit({
        name,
        targetAmount: parseFloat(targetAmount),
        savedAmount: savedAmount ? parseFloat(savedAmount) : 0,
        deadline: deadline || null,
        notes: notes || null,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {goal ? 'Edit Savings Goal' : 'Add Savings Goal'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Emergency Fund"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Saved Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={savedAmount}
              onChange={(e) => setSavedAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deadline (optional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Spinner size="sm" className="text-white" />}
              {goal ? 'Update' : 'Add'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
