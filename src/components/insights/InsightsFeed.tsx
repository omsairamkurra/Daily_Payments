'use client'

import { useState, useEffect, useCallback } from 'react'
import InsightCard from './InsightCard'

interface Insight {
  id: string
  insightType: string
  title: string
  description: string
  data: Record<string, unknown>
  period: string
}

interface InsightsFeedProps {
  maxItems?: number
}

export default function InsightsFeed({ maxItems = 5 }: InsightsFeedProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInsights = useCallback(async () => {
    try {
      const response = await fetch('/api/insights')
      if (response.ok) {
        const data = await response.json()
        setInsights(data.slice(0, maxItems))
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error)
    } finally {
      setLoading(false)
    }
  }, [maxItems])

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  const handleDismiss = async (id: string) => {
    try {
      const response = await fetch('/api/insights', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        setInsights((prev) => prev.filter((i) => i.id !== id))
      }
    } catch (error) {
      console.error('Failed to dismiss insight:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Spending Insights
      </h3>

      {insights.length === 0 ? (
        <div className="text-center py-6">
          <svg
            className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No new insights. Check back next week!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}
    </div>
  )
}
