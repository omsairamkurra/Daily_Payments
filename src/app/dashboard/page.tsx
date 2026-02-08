'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import DateFilter from '@/components/DateFilter'
import PaymentForm from '@/components/PaymentForm'
import PaymentList from '@/components/PaymentList'
import ExportButtons from '@/components/ExportButtons'
import BudgetSummaryCard from '@/components/BudgetSummaryCard'
import PageLoader from '@/components/ui/PageLoader'
import RefreshButton from '@/components/ui/RefreshButton'
import PaymentView from '@/components/PaymentView'
import SipSuggestionBanner from '@/components/SipSuggestionBanner'
import SafeToSpendCard from '@/components/SafeToSpendCard'

interface Payment {
  id: string
  date: string
  description: string
  amount: number
  location: string | null
  bank: string
  category: string
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedStartDate, setAppliedStartDate] = useState('')
  const [appliedEndDate, setAppliedEndDate] = useState('')
  const [budgetRefreshKey, setBudgetRefreshKey] = useState(0)
  const [budgetAmount, setBudgetAmount] = useState<number | null>(null)
  const [totalSpent, setTotalSpent] = useState<number>(0)

  const fetchBudgetData = useCallback(async () => {
    try {
      const month = new Date().getMonth() + 1
      const year = new Date().getFullYear()
      const response = await fetch(`/api/budgets?month=${month}&year=${year}`)
      if (response.ok) {
        const data = await response.json()
        if (data.budget) {
          setBudgetAmount(data.budget.salary)
          setTotalSpent(data.totalSpent)
        }
      }
    } catch (error) {
      console.error('Failed to fetch budget data:', error)
    }
  }, [])

  const fetchPayments = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (appliedStartDate) params.set('startDate', appliedStartDate)
      if (appliedEndDate) params.set('endDate', appliedEndDate)

      const response = await fetch(`/api/payments?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }, [appliedStartDate, appliedEndDate])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (!authLoading && user) {
      fetchPayments()
      fetchBudgetData()
    }
  }, [authLoading, user, router, fetchPayments, fetchBudgetData])

  useEffect(() => {
    if (budgetRefreshKey > 0) {
      fetchBudgetData()
    }
  }, [budgetRefreshKey, fetchBudgetData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPayments()
    setRefreshing(false)
  }

  const handleAddPayment = async (data: {
    date: string
    description: string
    amount: number
    location: string | null
    bank: string
    category: string
  }) => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setShowForm(false)
        fetchPayments()
        setBudgetRefreshKey((k) => k + 1)
      }
    } catch (error) {
      console.error('Failed to add payment:', error)
    }
  }

  const handleEditPayment = async (data: {
    date: string
    description: string
    amount: number
    location: string | null
    bank: string
    category: string
  }) => {
    if (!editingPayment) return

    try {
      const response = await fetch('/api/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingPayment.id, ...data }),
      })

      if (response.ok) {
        setEditingPayment(null)
        fetchPayments()
        setBudgetRefreshKey((k) => k + 1)
      }
    } catch (error) {
      console.error('Failed to update payment:', error)
    }
  }

  const handleDeletePayment = async (id: string) => {
    try {
      const response = await fetch(`/api/payments?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchPayments()
        setBudgetRefreshKey((k) => k + 1)
      }
    } catch (error) {
      console.error('Failed to delete payment:', error)
    }
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
        <BudgetSummaryCard refreshKey={budgetRefreshKey} />

        {budgetAmount !== null && budgetAmount > 0 && (
          <SafeToSpendCard budget={budgetAmount} spent={totalSpent} />
        )}

        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">My Payments</h1>
          <div className="flex flex-wrap gap-2 md:gap-4">
            <ExportButtons startDate={appliedStartDate} endDate={appliedEndDate} />
            <RefreshButton onClick={handleRefresh} isRefreshing={refreshing} />
            <button
              onClick={() => setShowForm(true)}
              className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm md:text-base"
            >
              Add Payment
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

        <SipSuggestionBanner onCreateSip={() => setShowForm(true)} />

        <PaymentList
          payments={payments}
          onEdit={(payment) => setEditingPayment(payment)}
          onDelete={handleDeletePayment}
          onView={(payment) => setViewingPayment(payment)}
        />
      </main>

      {showForm && (
        <PaymentForm
          onSubmit={handleAddPayment}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingPayment && (
        <PaymentForm
          payment={editingPayment}
          onSubmit={handleEditPayment}
          onCancel={() => setEditingPayment(null)}
        />
      )}

      {viewingPayment && (
        <PaymentView
          payment={viewingPayment}
          onClose={() => setViewingPayment(null)}
          onEdit={() => {
            setEditingPayment(viewingPayment)
            setViewingPayment(null)
          }}
        />
      )}
    </div>
  )
}
