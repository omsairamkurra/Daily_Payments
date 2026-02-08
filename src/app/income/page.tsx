'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import IncomeForm from '@/components/IncomeForm'
import IncomeList from '@/components/IncomeList'
import IncomeView from '@/components/IncomeView'
import IncomeSummaryCard from '@/components/IncomeSummaryCard'
import PageLoader from '@/components/ui/PageLoader'
import RefreshButton from '@/components/ui/RefreshButton'
import DateFilter from '@/components/DateFilter'

interface IncomeEntry {
  id: string
  date: string
  source: string
  description: string
  amount: number
  category: string
  isRecurring: boolean
  frequency: string | null
  notes: string | null
  createdAt?: string
  updatedAt?: string
}

export default function IncomePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [entries, setEntries] = useState<IncomeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<IncomeEntry | null>(null)
  const [viewingEntry, setViewingEntry] = useState<IncomeEntry | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [summaryRefreshKey, setSummaryRefreshKey] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedStartDate, setAppliedStartDate] = useState('')
  const [appliedEndDate, setAppliedEndDate] = useState('')

  const fetchEntries = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (appliedStartDate) params.set('startDate', appliedStartDate)
      if (appliedEndDate) params.set('endDate', appliedEndDate)

      const response = await fetch(`/api/income?${params.toString()}`)
      if (response.ok) {
        const data: IncomeEntry[] = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error('Failed to fetch income entries:', error)
    } finally {
      setLoading(false)
    }
  }, [appliedStartDate, appliedEndDate])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (!authLoading && user) {
      fetchEntries()
    }
  }, [authLoading, user, router, fetchEntries])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchEntries()
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

  const handleAddEntry = async (data: {
    date: string
    source: string
    description: string
    amount: number
    category: string
    isRecurring: boolean
    frequency: string | null
    notes: string | null
  }) => {
    try {
      const response = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setShowForm(false)
        fetchEntries()
        setSummaryRefreshKey((k) => k + 1)
      }
    } catch (error) {
      console.error('Failed to add income entry:', error)
    }
  }

  const handleEditEntry = async (data: {
    date: string
    source: string
    description: string
    amount: number
    category: string
    isRecurring: boolean
    frequency: string | null
    notes: string | null
  }) => {
    if (!editingEntry) return

    try {
      const response = await fetch('/api/income', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingEntry.id, ...data }),
      })

      if (response.ok) {
        setEditingEntry(null)
        fetchEntries()
        setSummaryRefreshKey((k) => k + 1)
      }
    } catch (error) {
      console.error('Failed to update income entry:', error)
    }
  }

  const handleDeleteEntry = async (id: string) => {
    try {
      const response = await fetch(`/api/income?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchEntries()
        setSummaryRefreshKey((k) => k + 1)
      }
    } catch (error) {
      console.error('Failed to delete income entry:', error)
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
        <IncomeSummaryCard refreshKey={summaryRefreshKey} />

        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            My Income
          </h1>
          <div className="flex flex-wrap gap-2 md:gap-4">
            <RefreshButton onClick={handleRefresh} isRefreshing={refreshing} />
            <button
              onClick={() => setShowForm(true)}
              className="px-4 md:px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm md:text-base"
            >
              Add Income
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

        <IncomeList
          entries={entries}
          onView={(entry) => setViewingEntry(entry)}
          onEdit={(entry) => setEditingEntry(entry)}
          onDelete={handleDeleteEntry}
        />
      </main>

      {showForm && (
        <IncomeForm
          onSubmit={handleAddEntry}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingEntry && (
        <IncomeForm
          income={editingEntry}
          onSubmit={handleEditEntry}
          onCancel={() => setEditingEntry(null)}
        />
      )}

      {viewingEntry && (
        <IncomeView
          income={viewingEntry}
          onClose={() => setViewingEntry(null)}
          onEdit={() => {
            setEditingEntry(viewingEntry)
            setViewingEntry(null)
          }}
        />
      )}
    </div>
  )
}
