'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import PageLoader from '@/components/ui/PageLoader'
import RefreshButton from '@/components/ui/RefreshButton'
import TaxSummaryCard from '@/components/tax/TaxSummaryCard'
import Section80CTracker from '@/components/tax/Section80CTracker'
import CapitalGainsTable from '@/components/tax/CapitalGainsTable'
import DeductionForm from '@/components/tax/DeductionForm'

interface Deduction {
  id: string
  financialYear: string
  section: string
  description: string
  amount: number
  proofNote: string | null
  investmentId: string | null
  createdAt?: string
}

interface TaxReport {
  financialYear: string
  totalIncome: number
  section80C: {
    total: number
    limit: number
    items: Array<{ description: string; amount: number; section: string }>
  }
  section80D: {
    total: number
    items: Array<{ description: string; amount: number; section: string }>
  }
  nps: {
    total: number
    items: Array<{ description: string; amount: number; section: string }>
  }
  otherDeductions: Array<{ description: string; amount: number; section: string }>
  capitalGains: {
    shortTerm: Array<{ name: string; invested: number; sold: number; gain: number }>
    longTerm: Array<{ name: string; invested: number; sold: number; gain: number }>
  }
  totalDeductions: number
  taxableIncome: number
  estimatedTax: number
}

function generateFYOptions(): Array<{ value: string; label: string }> {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function TaxReportPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const fyOptions = generateFYOptions()

  const [selectedFY, setSelectedFY] = useState(fyOptions[0]?.value || '')
  const [report, setReport] = useState<TaxReport | null>(null)
  const [deductions, setDeductions] = useState<Deduction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingDeduction, setEditingDeduction] = useState<Deduction | null>(null)
  const [error, setError] = useState('')

  const fetchReport = useCallback(async () => {
    try {
      setError('')
      const response = await fetch(`/api/tax/report?fy=${selectedFY}`)
      if (response.ok) {
        const data: TaxReport = await response.json()
        setReport(data)
      } else {
        setError('Failed to fetch tax report')
      }
    } catch (err) {
      console.error('Failed to fetch tax report:', err)
      setError('Failed to fetch tax report')
    }
  }, [selectedFY])

  const fetchDeductions = useCallback(async () => {
    try {
      const response = await fetch(`/api/tax/deductions?financialYear=${selectedFY}`)
      if (response.ok) {
        const data: Deduction[] = await response.json()
        setDeductions(data)
      }
    } catch (err) {
      console.error('Failed to fetch deductions:', err)
    }
  }, [selectedFY])

  const fetchAll = useCallback(async () => {
    await Promise.all([fetchReport(), fetchDeductions()])
    setLoading(false)
  }, [fetchReport, fetchDeductions])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (!authLoading && user) {
      setLoading(true)
      fetchAll()
    }
  }, [authLoading, user, router, fetchAll])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAll()
    setRefreshing(false)
  }

  const handleAddDeduction = async (data: {
    financialYear: string
    section: string
    description: string
    amount: number
    proofNote: string | null
    investmentId: string | null
  }) => {
    try {
      const response = await fetch('/api/tax/deductions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setShowForm(false)
        fetchAll()
      }
    } catch (err) {
      console.error('Failed to add deduction:', err)
    }
  }

  const handleEditDeduction = async (data: {
    financialYear: string
    section: string
    description: string
    amount: number
    proofNote: string | null
    investmentId: string | null
  }) => {
    if (!editingDeduction) return

    try {
      const response = await fetch('/api/tax/deductions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingDeduction.id, ...data }),
      })

      if (response.ok) {
        setEditingDeduction(null)
        fetchAll()
      }
    } catch (err) {
      console.error('Failed to update deduction:', err)
    }
  }

  const handleDeleteDeduction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deduction?')) return

    try {
      const response = await fetch(`/api/tax/deductions?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchAll()
      }
    } catch (err) {
      console.error('Failed to delete deduction:', err)
    }
  }

  if (authLoading || loading) {
    return <PageLoader />
  }

  if (!user) {
    return null
  }

  // Group deductions for the "Other Deductions" section display
  const manualDeductions = deductions.filter(
    (d) => !['80C'].includes(d.section) || d.section === '80C'
  )

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Tax & Returns Report
          </h1>
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            {/* FY Selector */}
            <select
              value={selectedFY}
              onChange={(e) => setSelectedFY(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
            >
              {fyOptions.map((fy) => (
                <option key={fy.value} value={fy.value}>
                  {fy.label}
                </option>
              ))}
            </select>

            <RefreshButton onClick={handleRefresh} isRefreshing={refreshing} />

            <button
              onClick={() => setShowForm(true)}
              className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm md:text-base"
            >
              Add Deduction
            </button>
          </div>
        </div>

        {report && (
          <div className="space-y-6">
            {/* Tax Summary */}
            <TaxSummaryCard
              totalIncome={report.totalIncome}
              totalDeductions={report.totalDeductions}
              taxableIncome={report.taxableIncome}
              estimatedTax={report.estimatedTax}
            />

            {/* Section 80C Tracker */}
            <Section80CTracker
              total={report.section80C.total}
              limit={report.section80C.limit}
              items={report.section80C.items}
            />

            {/* Section 80D */}
            {report.section80D.items.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Section 80D (Health Insurance)
                </h3>
                <div className="space-y-2">
                  {report.section80D.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {item.description}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Total
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(report.section80D.total)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* NPS Section */}
            {report.nps.items.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  NPS - Section 80CCD(1B)
                </h3>
                <div className="space-y-2">
                  {report.nps.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {item.description}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Total
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(report.nps.total)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Capital Gains */}
            <CapitalGainsTable
              shortTerm={report.capitalGains.shortTerm}
              longTerm={report.capitalGains.longTerm}
            />

            {/* Other Deductions */}
            {report.otherDeductions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Other Deductions
                </h3>
                <div className="space-y-2">
                  {report.otherDeductions.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {item.description}
                        </span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">
                          {item.section}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Manual Deductions - Manage */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Your Deductions ({selectedFY})
                </h3>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  + Add
                </button>
              </div>

              {manualDeductions.length > 0 ? (
                <div className="space-y-2">
                  {manualDeductions.map((d) => (
                    <div
                      key={d.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                            {d.description}
                          </span>
                          <span className="text-xs text-white bg-blue-500 dark:bg-blue-600 px-2 py-0.5 rounded">
                            {d.section}
                          </span>
                        </div>
                        {d.proofNote && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {d.proofNote}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatCurrency(d.amount)}
                        </span>
                        <button
                          onClick={() => setEditingDeduction(d)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDeduction(d.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                  No deductions added for {selectedFY}. Click &quot;Add Deduction&quot; to get started.
                </p>
              )}
            </div>
          </div>
        )}

        {!report && !loading && !error && (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">
              Select a financial year to view your tax report.
            </p>
          </div>
        )}
      </main>

      {/* Add Deduction Modal */}
      {showForm && (
        <DeductionForm
          defaultFinancialYear={selectedFY}
          onSubmit={handleAddDeduction}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit Deduction Modal */}
      {editingDeduction && (
        <DeductionForm
          deduction={editingDeduction}
          onSubmit={handleEditDeduction}
          onCancel={() => setEditingDeduction(null)}
        />
      )}
    </div>
  )
}
