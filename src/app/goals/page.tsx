'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import GoalForm from '@/components/GoalForm'
import GoalList from '@/components/GoalList'
import PageLoader from '@/components/ui/PageLoader'
import RefreshButton from '@/components/ui/RefreshButton'
import DateFilter from '@/components/DateFilter'
import GoalView from '@/components/GoalView'

interface Goal {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
  deadline: string | null
  notes: string | null
}

export default function GoalsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [viewingGoal, setViewingGoal] = useState<Goal | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedStartDate, setAppliedStartDate] = useState('')
  const [appliedEndDate, setAppliedEndDate] = useState('')

  const fetchGoals = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (appliedStartDate) params.set('startDate', appliedStartDate)
      if (appliedEndDate) params.set('endDate', appliedEndDate)
      const response = await fetch(`/api/goals?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    } finally {
      setLoading(false)
    }
  }, [appliedStartDate, appliedEndDate])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (!authLoading && user) {
      fetchGoals()
    }
  }, [authLoading, user, router, fetchGoals])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchGoals()
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

  const handleAddGoal = async (data: {
    name: string
    targetAmount: number
    savedAmount: number
    deadline: string | null
    notes: string | null
  }) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setShowForm(false)
        fetchGoals()
      }
    } catch (error) {
      console.error('Failed to add goal:', error)
    }
  }

  const handleEditGoal = async (data: {
    name: string
    targetAmount: number
    savedAmount: number
    deadline: string | null
    notes: string | null
  }) => {
    if (!editingGoal) return

    try {
      const response = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingGoal.id, ...data }),
      })

      if (response.ok) {
        setEditingGoal(null)
        fetchGoals()
      }
    } catch (error) {
      console.error('Failed to update goal:', error)
    }
  }

  const handleDeleteGoal = async (id: string) => {
    try {
      const response = await fetch(`/api/goals?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchGoals()
      }
    } catch (error) {
      console.error('Failed to delete goal:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (authLoading || loading) {
    return <PageLoader />
  }

  if (!user) {
    return null
  }

  const totalSaved = goals.reduce((sum, goal) => sum + goal.savedAmount, 0)
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Savings Goals</h1>
          <div className="flex gap-2">
            <RefreshButton onClick={handleRefresh} isRefreshing={refreshing} />
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Add Goal
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

        {/* Summary */}
        {goals.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overall Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Saved</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(totalSaved)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Target</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalTarget)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Overall Progress</p>
                <p className="text-xl font-bold text-blue-600">
                  {overallProgress.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              />
            </div>
          </div>
        )}

        <GoalList
          goals={goals}
          onEdit={(goal) => setEditingGoal(goal)}
          onDelete={handleDeleteGoal}
          onView={(goal) => setViewingGoal(goal)}
        />
      </main>

      {showForm && (
        <GoalForm
          onSubmit={handleAddGoal}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingGoal && (
        <GoalForm
          goal={editingGoal}
          onSubmit={handleEditGoal}
          onCancel={() => setEditingGoal(null)}
        />
      )}

      {viewingGoal && (
        <GoalView
          goal={viewingGoal}
          onClose={() => setViewingGoal(null)}
          onEdit={() => {
            setEditingGoal(viewingGoal)
            setViewingGoal(null)
          }}
        />
      )}
    </div>
  )
}
