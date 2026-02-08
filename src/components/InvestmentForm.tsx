'use client'

import { useState, useEffect } from 'react'
import Spinner from './ui/Spinner'

interface Investment {
  id: string
  name: string
  type: string
  app: string
  investedAmount: number
  currentValue: number | null
  units: number | null
  purchaseDate: string
  notes: string | null
  frequency?: string
  isSip?: boolean
  sipAmount?: number | null
  nextSipDate?: string | null
  goalId?: string | null
}

interface Goal {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
}

interface InvestmentFormProps {
  investment?: Investment | null
  onSubmit: (data: {
    name: string
    type: string
    app: string
    investedAmount: number
    currentValue: number | null
    units: number | null
    purchaseDate: string
    notes: string | null
    frequency: string
    isSip: boolean
    sipAmount: number | null
    nextSipDate: string | null
    goalId: string | null
  }) => void | Promise<void>
  onCancel: () => void
}

const INVESTMENT_TYPES = [
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'stock', label: 'Stock' },
  { value: 'sip', label: 'SIP' },
  { value: 'fd', label: 'Fixed Deposit (FD)' },
  { value: 'ppf', label: 'PPF' },
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'other', label: 'Other' },
]

const INVESTMENT_APPS = [
  'PhonePe', 'Navi', 'Groww', 'Zerodha', 'Upstox',
  'Angel One', 'Paytm Money', 'SBI YONO', 'CAMS', 'MFCentral', 'Other'
]

const FREQUENCIES = [
  { value: 'one_time', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export default function InvestmentForm({
  investment,
  onSubmit,
  onCancel,
}: InvestmentFormProps) {
  const [name, setName] = useState(investment?.name || '')
  const [type, setType] = useState(investment?.type || 'mutual_fund')
  const [app, setApp] = useState(investment?.app || '')
  const [investedAmount, setInvestedAmount] = useState(
    investment?.investedAmount?.toString() || ''
  )
  const [currentValue, setCurrentValue] = useState(
    investment?.currentValue?.toString() || ''
  )
  const [units, setUnits] = useState(investment?.units?.toString() || '')
  const [purchaseDate, setPurchaseDate] = useState(
    investment?.purchaseDate
      ? new Date(investment.purchaseDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState(investment?.notes || '')
  const [frequency, setFrequency] = useState(investment?.frequency || 'one_time')
  const [sipAmount, setSipAmount] = useState(investment?.sipAmount?.toString() || '')
  const [nextSipDate, setNextSipDate] = useState(
    investment?.nextSipDate
      ? new Date(investment.nextSipDate).toISOString().split('T')[0]
      : ''
  )
  const [goalId, setGoalId] = useState(investment?.goalId || '')
  const [goals, setGoals] = useState<Goal[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/goals')
      .then(res => res.ok ? res.json() : [])
      .then(data => setGoals(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (type === 'sip') {
      setFrequency('monthly')
    }
  }, [type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const isSip = frequency !== 'one_time'
      await onSubmit({
        name,
        type,
        app,
        investedAmount: parseFloat(investedAmount),
        currentValue: currentValue ? parseFloat(currentValue) : null,
        units: units ? parseFloat(units) : null,
        purchaseDate,
        notes: notes || null,
        frequency,
        isSip,
        sipAmount: sipAmount ? parseFloat(sipAmount) : null,
        nextSipDate: nextSipDate || null,
        goalId: goalId || null,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {investment ? 'Edit Investment' : 'Add Investment'}
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
              placeholder="e.g., HDFC Midcap Fund"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {INVESTMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              App (optional)
            </label>
            <select
              value={app}
              onChange={(e) => setApp(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select App</option>
              {INVESTMENT_APPS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invested Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={investedAmount}
              onChange={(e) => setInvestedAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {frequency !== 'one_time' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SIP Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={sipAmount}
                  onChange={(e) => setSipAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next SIP Date
                </label>
                <input
                  type="date"
                  value={nextSipDate}
                  onChange={(e) => setNextSipDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Value (optional)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Units/Shares (optional)
            </label>
            <input
              type="number"
              step="0.0001"
              min="0"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {goals.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link to Goal (optional)
              </label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No goal linked</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              {investment ? 'Update' : 'Add'}
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
