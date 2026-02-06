'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import RecurringForm from '@/components/RecurringForm'
import RecurringList from '@/components/RecurringList'

interface RecurringPayment {
  id: string
  name: string
  amount: number
  frequency: string
  bank: string
  category: string
  startDate: string
  nextDueDate: string
  isActive: boolean
  notes: string | null
}

export default function RecurringPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [recurring, setRecurring] = useState<RecurringPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState<RecurringPayment | null>(null)

  const fetchRecurring = useCallback(async () => {
    try {
      const response = await fetch('/api/recurring')
      if (response.ok) {
        const data = await response.json()
        setRecurring(data)
      }
    } catch (error) {
      console.error('Failed to fetch recurring payments:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (!authLoading && user) {
      fetchRecurring()
    }
  }, [authLoading, user, router, fetchRecurring])

  const handleAdd = async (data: Omit<RecurringPayment, 'id'>) => {
    try {
      const response = await fetch('/api/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setShowForm(false)
        fetchRecurring()
      }
    } catch (error) {
      console.error('Failed to add recurring payment:', error)
    }
  }

  const handleEdit = async (data: Omit<RecurringPayment, 'id'>) => {
    if (!editingRecurring) return

    try {
      const response = await fetch('/api/recurring', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingRecurring.id, ...data }),
      })

      if (response.ok) {
        setEditingRecurring(null)
        fetchRecurring()
      }
    } catch (error) {
      console.error('Failed to update recurring payment:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/recurring?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchRecurring()
      }
    } catch (error) {
      console.error('Failed to delete recurring payment:', error)
    }
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
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Recurring Payments</h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm md:text-base"
          >
            Add Recurring Payment
          </button>
        </div>

        <RecurringList
          recurring={recurring}
          onEdit={(item) => setEditingRecurring(item)}
          onDelete={handleDelete}
        />
      </main>

      {showForm && (
        <RecurringForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingRecurring && (
        <RecurringForm
          recurring={editingRecurring}
          onSubmit={handleEdit}
          onCancel={() => setEditingRecurring(null)}
        />
      )}
    </div>
  )
}
