'use client'

import { useState } from 'react'
import Spinner from './ui/Spinner'

interface Loan {
  id: string
  name: string
  bank: string
  loanAmount: number
  emiAmount: number
  interestRate: number
  tenureMonths: number
  startDate: string
  paidEmis: number
  notes: string | null
}

interface LoanFormProps {
  loan?: Loan | null
  onSubmit: (data: {
    name: string
    bank: string
    loanAmount: number
    emiAmount: number
    interestRate: number
    tenureMonths: number
    startDate: string
    paidEmis: number
    notes: string | null
  }) => void | Promise<void>
  onCancel: () => void
}

const BANKS = [
  'HDFC',
  'SBI',
  'Bank of Baroda',
  'IDFC First Bank',
  'Union Bank',
  'Axis',
  'ICICI',
  'Indian Bank',
]

export default function LoanForm({
  loan,
  onSubmit,
  onCancel,
}: LoanFormProps) {
  const [name, setName] = useState(loan?.name || '')
  const [bank, setBank] = useState(loan?.bank || '')
  const [loanAmount, setLoanAmount] = useState(
    loan?.loanAmount?.toString() || ''
  )
  const [emiAmount, setEmiAmount] = useState(
    loan?.emiAmount?.toString() || ''
  )
  const [interestRate, setInterestRate] = useState(
    loan?.interestRate?.toString() || ''
  )
  const [tenureMonths, setTenureMonths] = useState(
    loan?.tenureMonths?.toString() || ''
  )
  const [startDate, setStartDate] = useState(
    loan?.startDate
      ? new Date(loan.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [paidEmis, setPaidEmis] = useState(
    loan?.paidEmis?.toString() || '0'
  )
  const [notes, setNotes] = useState(loan?.notes || '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await onSubmit({
        name,
        bank,
        loanAmount: parseFloat(loanAmount),
        emiAmount: parseFloat(emiAmount),
        interestRate: parseFloat(interestRate),
        tenureMonths: parseInt(tenureMonths),
        startDate,
        paidEmis: parseInt(paidEmis) || 0,
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
          {loan ? 'Edit Loan' : 'Add Loan'}
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
              placeholder="e.g., Home Loan"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank
            </label>
            <select
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Bank</option>
              {BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loan Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              EMI Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={emiAmount}
              onChange={(e) => setEmiAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate %
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tenure (months)
            </label>
            <input
              type="number"
              min="1"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(e.target.value)}
              placeholder="12"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paid EMIs
            </label>
            <input
              type="number"
              min="0"
              value={paidEmis}
              onChange={(e) => setPaidEmis(e.target.value)}
              placeholder="0"
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
              {loan ? 'Update' : 'Add'}
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
