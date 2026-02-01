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

interface Payment {
  id: string
  date: string
  description: string
  amount: number
  location: string | null
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedStartDate, setAppliedStartDate] = useState('')
  const [appliedEndDate, setAppliedEndDate] = useState('')
  const [budgetRefreshKey, setBudgetRefreshKey] = useState(0)

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
    }
  }, [authLoading, user, router, fetchPayments])

  const handleAddPayment = async (data: {
    date: string
    description: string
    amount: number
    location: string | null
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
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <BudgetSummaryCard refreshKey={budgetRefreshKey} />

        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Payments</h1>
          <div className="flex flex-wrap gap-2 md:gap-4">
            <ExportButtons startDate={appliedStartDate} endDate={appliedEndDate} />
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

        <PaymentList
          payments={payments}
          onEdit={(payment) => setEditingPayment(payment)}
          onDelete={handleDeletePayment}
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
    </div>
  )
}
