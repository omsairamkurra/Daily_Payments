'use client'

import { useState, useEffect, useCallback } from 'react'

interface IncomeEntry {
  id: string
  date: string
  source: string
  amount: number
}

interface IncomeSummaryCardProps {
  refreshKey?: number
}

const SOURCE_COLORS: Record<string, string> = {
  Salary: 'bg-green-500',
  Freelance: 'bg-blue-500',
  'Investment Returns': 'bg-purple-500',
  Rental: 'bg-yellow-500',
  Business: 'bg-indigo-500',
  Gift: 'bg-pink-500',
  Refund: 'bg-orange-500',
  Other: 'bg-gray-500',
}

const SOURCE_BADGE_COLORS: Record<string, string> = {
  Salary: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  Freelance: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Investment Returns': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  Rental: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  Business: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  Gift: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  Refund: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  Other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

export default function IncomeSummaryCard({ refreshKey }: IncomeSummaryCardProps) {
  const [entries, setEntries] = useState<IncomeEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCurrentMonthIncome = useCallback(async () => {
    try {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const params = new URLSearchParams()
      params.set('startDate', firstDay.toISOString().split('T')[0])
      params.set('endDate', lastDay.toISOString().split('T')[0])

      const response = await fetch(`/api/income?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error('Failed to fetch income summary:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCurrentMonthIncome()
  }, [fetchCurrentMonthIncome, refreshKey])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getMonthName = () => {
    const now = new Date()
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ]
    return `${months[now.getMonth()]} ${now.getFullYear()}`
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const totalIncome = entries.reduce((sum, e) => sum + e.amount, 0)

  // Group by source
  const sourceBreakdown: Record<string, number> = {}
  entries.forEach((entry) => {
    sourceBreakdown[entry.source] = (sourceBreakdown[entry.source] || 0) + entry.amount
  })

  const sortedSources = Object.entries(sourceBreakdown).sort((a, b) => b[1] - a[1])

  if (totalIncome === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {getMonthName()} Income
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">No income recorded this month</p>
          </div>
          <p className="text-2xl font-bold text-gray-400 dark:text-gray-500">
            {formatCurrency(0)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          {getMonthName()} Income
        </h3>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
          {formatCurrency(totalIncome)}
        </p>
      </div>

      {/* Progress bar showing source breakdown */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4 flex overflow-hidden">
        {sortedSources.map(([source, amount]) => {
          const percentage = (amount / totalIncome) * 100
          const barColor = SOURCE_COLORS[source] || SOURCE_COLORS.Other
          return (
            <div
              key={source}
              className={`h-3 ${barColor} transition-all`}
              style={{ width: `${percentage}%` }}
              title={`${source}: ${formatCurrency(amount)} (${percentage.toFixed(1)}%)`}
            ></div>
          )
        })}
      </div>

      {/* Source badges with amounts */}
      <div className="flex flex-wrap gap-2">
        {sortedSources.map(([source, amount]) => {
          const badgeColors = SOURCE_BADGE_COLORS[source] || SOURCE_BADGE_COLORS.Other
          const percentage = ((amount / totalIncome) * 100).toFixed(1)
          return (
            <span
              key={source}
              className={`px-3 py-1 text-xs font-medium rounded-full ${badgeColors}`}
            >
              {source}: {formatCurrency(amount)} ({percentage}%)
            </span>
          )
        })}
      </div>
    </div>
  )
}
