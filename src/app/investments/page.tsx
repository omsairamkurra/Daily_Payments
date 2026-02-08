'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import InvestmentForm from '@/components/InvestmentForm'
import InvestmentList from '@/components/InvestmentList'
import PortfolioSummary from '@/components/PortfolioSummary'
import PageLoader from '@/components/ui/PageLoader'
import RefreshButton from '@/components/ui/RefreshButton'
import DateFilter from '@/components/DateFilter'
import InvestmentView from '@/components/InvestmentView'

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

export default function InvestmentsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [viewingInvestment, setViewingInvestment] = useState<Investment | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedStartDate, setAppliedStartDate] = useState('')
  const [appliedEndDate, setAppliedEndDate] = useState('')
  const [error, setError] = useState('')

  const fetchInvestments = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (appliedStartDate) params.set('startDate', appliedStartDate)
      if (appliedEndDate) params.set('endDate', appliedEndDate)
      const response = await fetch(`/api/investments?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setInvestments(data)
      } else {
        setError('Failed to fetch investments')
      }
    } catch (error) {
      console.error('Failed to fetch investments:', error)
      setError('Failed to fetch investments')
    } finally {
      setLoading(false)
    }
  }, [appliedStartDate, appliedEndDate])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (!authLoading && user) {
      fetchInvestments()
    }
  }, [authLoading, user, router, fetchInvestments])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchInvestments()
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

  const handleAddInvestment = async (data: {
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
  }) => {
    try {
      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setShowForm(false)
        fetchInvestments()
      }
    } catch (error) {
      console.error('Failed to add investment:', error)
    }
  }

  const handleEditInvestment = async (data: {
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
  }) => {
    if (!editingInvestment) return

    try {
      const response = await fetch('/api/investments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingInvestment.id, ...data }),
      })

      if (response.ok) {
        setEditingInvestment(null)
        fetchInvestments()
      }
    } catch (error) {
      console.error('Failed to update investment:', error)
    }
  }

  const handleDeleteInvestment = async (id: string) => {
    try {
      const response = await fetch(`/api/investments?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchInvestments()
      }
    } catch (error) {
      console.error('Failed to delete investment:', error)
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
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Investments</h1>
          <div className="flex gap-2">
            <RefreshButton onClick={handleRefresh} isRefreshing={refreshing} />
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Add Investment
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

        <PortfolioSummary investments={investments} />

        <InvestmentList
          investments={investments}
          onEdit={(investment) => setEditingInvestment(investment)}
          onDelete={handleDeleteInvestment}
          onView={(investment) => setViewingInvestment(investment)}
        />
      </main>

      {showForm && (
        <InvestmentForm
          onSubmit={handleAddInvestment}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingInvestment && (
        <InvestmentForm
          investment={editingInvestment}
          onSubmit={handleEditInvestment}
          onCancel={() => setEditingInvestment(null)}
        />
      )}

      {viewingInvestment && (
        <InvestmentView
          investment={viewingInvestment}
          onClose={() => setViewingInvestment(null)}
          onEdit={() => {
            setEditingInvestment(viewingInvestment)
            setViewingInvestment(null)
          }}
        />
      )}
    </div>
  )
}
