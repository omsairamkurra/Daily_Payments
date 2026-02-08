'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import LoanForm from '@/components/LoanForm'
import LoanList from '@/components/LoanList'
import PageLoader from '@/components/ui/PageLoader'
import RefreshButton from '@/components/ui/RefreshButton'
import DateFilter from '@/components/DateFilter'
import LoanView from '@/components/LoanView'

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

export default function LoansPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [viewingLoan, setViewingLoan] = useState<Loan | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedStartDate, setAppliedStartDate] = useState('')
  const [appliedEndDate, setAppliedEndDate] = useState('')

  const fetchLoans = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (appliedStartDate) params.set('startDate', appliedStartDate)
      if (appliedEndDate) params.set('endDate', appliedEndDate)
      const response = await fetch(`/api/loans?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setLoans(data)
      }
    } catch (error) {
      console.error('Failed to fetch loans:', error)
    } finally {
      setLoading(false)
    }
  }, [appliedStartDate, appliedEndDate])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (!authLoading && user) {
      fetchLoans()
    }
  }, [authLoading, user, router, fetchLoans])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchLoans()
    setRefreshing(false)
  }

  const applyFilter = () => {
    setAppliedStartDate(startDate)
    setAppliedEndDate(endDate)
  }

  const clearFilter = () => {
    setStartDate('')
    setEndDate('')
    setAppliedStartDate('')
    setAppliedEndDate('')
  }

  const handleAddLoan = async (data: {
    name: string
    bank: string
    loanAmount: number
    emiAmount: number
    interestRate: number
    tenureMonths: number
    startDate: string
    paidEmis: number
    notes: string | null
  }) => {
    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setShowForm(false)
        fetchLoans()
      }
    } catch (error) {
      console.error('Failed to add loan:', error)
    }
  }

  const handleEditLoan = async (data: {
    name: string
    bank: string
    loanAmount: number
    emiAmount: number
    interestRate: number
    tenureMonths: number
    startDate: string
    paidEmis: number
    notes: string | null
  }) => {
    if (!editingLoan) return

    try {
      const response = await fetch('/api/loans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingLoan.id, ...data }),
      })

      if (response.ok) {
        setEditingLoan(null)
        fetchLoans()
      }
    } catch (error) {
      console.error('Failed to update loan:', error)
    }
  }

  const handleDeleteLoan = async (id: string) => {
    try {
      const response = await fetch(`/api/loans?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchLoans()
      }
    } catch (error) {
      console.error('Failed to delete loan:', error)
    }
  }

  if (authLoading || loading) {
    return <PageLoader />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">EMI / Loan Tracker</h1>
          <div className="flex gap-2">
            <RefreshButton onClick={handleRefresh} isRefreshing={refreshing} />
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Add Loan
            </button>
          </div>
        </div>

        <DateFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onApply={applyFilter}
          onClear={clearFilter}
        />

        <LoanList
          loans={loans}
          onEdit={(loan) => setEditingLoan(loan)}
          onDelete={handleDeleteLoan}
          onView={(loan) => setViewingLoan(loan)}
        />
      </main>

      {showForm && (
        <LoanForm
          onSubmit={handleAddLoan}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingLoan && (
        <LoanForm
          loan={editingLoan}
          onSubmit={handleEditLoan}
          onCancel={() => setEditingLoan(null)}
        />
      )}

      {viewingLoan && (
        <LoanView
          loan={viewingLoan}
          onClose={() => setViewingLoan(null)}
          onEdit={() => {
            setEditingLoan(viewingLoan)
            setViewingLoan(null)
          }}
        />
      )}
    </div>
  )
}
