'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import CategoryFilter from '@/components/CategoryFilter'
import PageLoader from '@/components/ui/PageLoader'
import RefreshButton from '@/components/ui/RefreshButton'
import DateFilter from '@/components/DateFilter'

interface Payment {
  id: string
  date: string
  description: string
  amount: number
  location: string | null
  bank: string
  category: string
}

interface CategorySummary {
  category: string
  total: number
  count: number
  percentage: number
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'bg-orange-100 text-orange-800 border-orange-200',
  Transport: 'bg-blue-100 text-blue-800 border-blue-200',
  Bills: 'bg-red-100 text-red-800 border-red-200',
  Shopping: 'bg-pink-100 text-pink-800 border-pink-200',
  Entertainment: 'bg-purple-100 text-purple-800 border-purple-200',
  Health: 'bg-green-100 text-green-800 border-green-200',
  Education: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Rent: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Other: 'bg-gray-100 text-gray-800 border-gray-200',
}

export default function CategoriesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedStartDate, setAppliedStartDate] = useState('')
  const [appliedEndDate, setAppliedEndDate] = useState('')

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

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPayments()
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

  const grandTotal = payments.reduce((sum, p) => sum + p.amount, 0)

  const categorySummaries: CategorySummary[] = (() => {
    const map: Record<string, { total: number; count: number }> = {}

    payments.forEach((payment) => {
      const cat = payment.category || 'Other'
      if (!map[cat]) {
        map[cat] = { total: 0, count: 0 }
      }
      map[cat].total += payment.amount
      map[cat].count += 1
    })

    return Object.entries(map)
      .map(([category, { total, count }]) => ({
        category,
        total,
        count,
        percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)
  })()

  const filteredPayments = selectedCategory
    ? payments.filter(
        (p) =>
          p.category === selectedCategory ||
          (!p.category && selectedCategory === 'Other')
      )
    : payments

  const filteredTotal = filteredPayments.reduce((sum, p) => sum + p.amount, 0)

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
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Category Breakdown
          </h1>
          <div className="flex gap-2 items-center">
            <RefreshButton onClick={handleRefresh} isRefreshing={refreshing} />
            <div className="w-full md:w-64">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
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

        {/* Category Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {categorySummaries.map((summary) => {
            const colorClasses =
              CATEGORY_COLORS[summary.category] || CATEGORY_COLORS.Other
            return (
              <div
                key={summary.category}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === summary.category
                      ? ''
                      : summary.category
                  )
                }
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${colorClasses} ${
                  selectedCategory === summary.category
                    ? 'ring-2 ring-blue-500 shadow-md'
                    : ''
                }`}
              >
                <h3 className="font-semibold text-sm md:text-base truncate">
                  {summary.category}
                </h3>
                <p className="text-lg md:text-xl font-bold mt-1">
                  ₹{summary.total.toFixed(2)}
                </p>
                <div className="flex justify-between items-center mt-2 text-xs md:text-sm opacity-75">
                  <span>
                    {summary.count} payment{summary.count !== 1 ? 's' : ''}
                  </span>
                  <span>{summary.percentage.toFixed(1)}%</span>
                </div>
              </div>
            )
          })}
        </div>

        {categorySummaries.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-500 dark:text-gray-400 mb-8">
            No payments found. Add payments from the dashboard to see category
            breakdown.
          </div>
        )}

        {/* Filtered Payments Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedCategory
                ? `${selectedCategory} Payments`
                : 'All Payments'}
            </h2>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No payments found
              {selectedCategory ? ` for ${selectedCategory}` : ''}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Bank
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {payment.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                        ₹{payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {payment.bank || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <td
                      colSpan={2}
                      className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Total
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white text-right">
                      ₹{filteredTotal.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
