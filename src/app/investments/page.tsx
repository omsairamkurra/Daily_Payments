'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import InvestmentForm from '@/components/InvestmentForm'
import InvestmentList from '@/components/InvestmentList'
import PortfolioSummary from '@/components/PortfolioSummary'

interface Investment {
  id: string
  name: string
  type: string
  investedAmount: number
  currentValue: number | null
  units: number | null
  purchaseDate: string
  notes: string | null
}

export default function InvestmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null)

  const fetchInvestments = useCallback(async () => {
    try {
      const response = await fetch('/api/investments')
      if (response.ok) {
        const data = await response.json()
        setInvestments(data)
      }
    } catch (error) {
      console.error('Failed to fetch investments:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchInvestments()
    }
  }, [status, router, fetchInvestments])

  const handleAddInvestment = async (data: {
    name: string
    type: string
    investedAmount: number
    currentValue: number | null
    units: number | null
    purchaseDate: string
    notes: string | null
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
    investedAmount: number
    currentValue: number | null
    units: number | null
    purchaseDate: string
    notes: string | null
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Investments</h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Add Investment
          </button>
        </div>

        <PortfolioSummary investments={investments} />

        <InvestmentList
          investments={investments}
          onEdit={(investment) => setEditingInvestment(investment)}
          onDelete={handleDeleteInvestment}
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
    </div>
  )
}
