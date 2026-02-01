'use client'

import { useState, useEffect, useCallback } from 'react'
import BudgetForm from './BudgetForm'

interface BudgetData {
  budget: {
    id: string
    month: number
    year: number
    salary: number
  } | null
  totalSpent: number
  remaining: number | null
}

interface BudgetSummaryCardProps {
  refreshKey?: number
}

export default function BudgetSummaryCard({ refreshKey }: BudgetSummaryCardProps) {
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [currentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear] = useState(new Date().getFullYear())

  const fetchBudget = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/budgets?month=${currentMonth}&year=${currentYear}`
      )
      if (response.ok) {
        const data = await response.json()
        setBudgetData(data)
      }
    } catch (error) {
      console.error('Failed to fetch budget:', error)
    } finally {
      setLoading(false)
    }
  }, [currentMonth, currentYear])

  useEffect(() => {
    fetchBudget()
  }, [fetchBudget, refreshKey])

  const handleSetBudget = async (data: {
    month: number
    year: number
    salary: number
  }) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setShowForm(false)
        fetchBudget()
      }
    } catch (error) {
      console.error('Failed to set budget:', error)
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

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[month - 1]
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!budgetData?.budget) {
    return (
      <>
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                {getMonthName(currentMonth)} {currentYear} Budget
              </h3>
              <p className="text-gray-500 mt-1">No budget set for this month</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Set Budget
            </button>
          </div>
        </div>

        {showForm && (
          <BudgetForm
            month={currentMonth}
            year={currentYear}
            onSubmit={handleSetBudget}
            onCancel={() => setShowForm(false)}
          />
        )}
      </>
    )
  }

  const { budget, totalSpent, remaining } = budgetData
  const spentPercentage = (totalSpent / budget.salary) * 100
  const isOverBudget = remaining !== null && remaining < 0

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            {getMonthName(budget.month)} {budget.year} Budget
          </h3>
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Budget</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(budget.salary)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Spent</p>
            <p className="text-xl font-bold text-orange-600">
              {formatCurrency(totalSpent)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Remaining</p>
            <p
              className={`text-xl font-bold ${
                isOverBudget ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {formatCurrency(remaining || 0)}
            </p>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              spentPercentage > 100
                ? 'bg-red-500'
                : spentPercentage > 80
                ? 'bg-orange-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">
          {spentPercentage.toFixed(1)}% of budget used
        </p>
      </div>

      {showForm && (
        <BudgetForm
          month={budget.month}
          year={budget.year}
          currentSalary={budget.salary}
          onSubmit={handleSetBudget}
          onCancel={() => setShowForm(false)}
        />
      )}
    </>
  )
}
