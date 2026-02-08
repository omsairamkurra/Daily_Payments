'use client'

import { useState } from 'react'
import Spinner from '../ui/Spinner'

interface Deduction {
  id: string
  financialYear: string
  section: string
  description: string
  amount: number
  proofNote: string | null
  investmentId: string | null
}

interface DeductionFormProps {
  deduction?: Deduction | null
  defaultFinancialYear?: string
  onSubmit: (data: {
    financialYear: string
    section: string
    description: string
    amount: number
    proofNote: string | null
    investmentId: string | null
  }) => void | Promise<void>
  onCancel: () => void
}

const SECTIONS = [
  { value: '80C', label: 'Section 80C (PPF, ELSS, LIC, etc.)' },
  { value: '80D', label: 'Section 80D (Health Insurance)' },
  { value: '80E', label: 'Section 80E (Education Loan Interest)' },
  { value: '80G', label: 'Section 80G (Donations)' },
  { value: 'HRA', label: 'HRA (House Rent Allowance)' },
  { value: 'NPS', label: 'NPS (80CCD(1B))' },
  { value: 'Other', label: 'Other Deduction' },
]

function generateFYOptions(): Array<{ value: string; label: string }> {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-indexed

  // Indian FY starts in April. If before April, current FY started previous year.
  const currentFYStartYear = currentMonth >= 3 ? currentYear : currentYear - 1

  const options: Array<{ value: string; label: string }> = []
  for (let i = 0; i < 3; i++) {
    const startYear = currentFYStartYear - i
    const endYearShort = (startYear + 1).toString().slice(-2)
    const value = `${startYear}-${endYearShort}`
    options.push({ value, label: `FY ${value}` })
  }
  return options
}

export default function DeductionForm({
  deduction,
  defaultFinancialYear,
  onSubmit,
  onCancel,
}: DeductionFormProps) {
  const fyOptions = generateFYOptions()

  const [financialYear, setFinancialYear] = useState(
    deduction?.financialYear || defaultFinancialYear || fyOptions[0]?.value || ''
  )
  const [section, setSection] = useState(deduction?.section || '80C')
  const [description, setDescription] = useState(deduction?.description || '')
  const [amount, setAmount] = useState(deduction?.amount?.toString() || '')
  const [proofNote, setProofNote] = useState(deduction?.proofNote || '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit({
        financialYear,
        section,
        description,
        amount: parseFloat(amount),
        proofNote: proofNote || null,
        investmentId: null,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {deduction ? 'Edit Deduction' : 'Add Deduction'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Financial Year
            </label>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              {fyOptions.map((fy) => (
                <option key={fy.value} value={fy.value}>
                  {fy.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Section
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              {SECTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., LIC Premium, Health Insurance"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Proof / Notes (Optional)
            </label>
            <textarea
              value={proofNote}
              onChange={(e) => setProofNote(e.target.value)}
              placeholder="Reference number, receipt details, etc."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Spinner size="sm" className="text-white" />}
              {deduction ? 'Update' : 'Add'}
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
