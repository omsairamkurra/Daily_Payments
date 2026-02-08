'use client'

import { useState } from 'react'
import Spinner from './ui/Spinner'

interface BudgetFormProps {
  month: number
  year: number
  currentSalary?: number
  onSubmit: (data: { month: number; year: number; salary: number }) => void | Promise<void>
  onCancel: () => void
}

export default function BudgetForm({
  month,
  year,
  currentSalary,
  onSubmit,
  onCancel,
}: BudgetFormProps) {
  const [selectedMonth, setSelectedMonth] = useState(month)
  const [selectedYear, setSelectedYear] = useState(year)
  const [salary, setSalary] = useState(currentSalary?.toString() || '')
  const [submitting, setSubmitting] = useState(false)

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await onSubmit({
        month: selectedMonth,
        year: selectedYear,
        salary: parseFloat(salary),
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {currentSalary ? 'Update Budget' : 'Set Monthly Budget'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {months.map((m, index) => (
                  <option key={index + 1} value={index + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Monthly Salary/Budget
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Spinner size="sm" className="text-white" />}
              {currentSalary ? 'Update' : 'Set Budget'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
