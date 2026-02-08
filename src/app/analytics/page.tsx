'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import PageLoader from '@/components/ui/PageLoader'
import KpiCards from '@/components/analytics/KpiCards'

const SpendingTrendChart = dynamic(
  () => import('@/components/analytics/SpendingTrendChart'),
  { ssr: false }
)
const CategoryPieChart = dynamic(
  () => import('@/components/analytics/CategoryPieChart'),
  { ssr: false }
)
const IncomeVsExpenseChart = dynamic(
  () => import('@/components/analytics/IncomeVsExpenseChart'),
  { ssr: false }
)
const MonthComparisonChart = dynamic(
  () => import('@/components/analytics/MonthComparisonChart'),
  { ssr: false }
)
const DailySpendingChart = dynamic(
  () => import('@/components/analytics/DailySpendingChart'),
  { ssr: false }
)

interface OverviewData {
  totalIncome: number
  totalExpenses: number
  netSavings: number
  savingsRate: number
  monthOverMonthChange: number
}

interface MonthData {
  month: string
  categories: Record<string, number>
  total: number
}

interface DailyData {
  day: string
  amount: number
}

interface IncomeVsExpenseData {
  month: string
  income: number
  expenses: number
}

interface SpendingData {
  months: MonthData[]
  daily: DailyData[]
  incomeVsExpense: IncomeVsExpenseData[]
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [spending, setSpending] = useState<SpendingData | null>(null)

  const fetchAnalytics = useCallback(async () => {
    try {
      const [overviewRes, spendingRes] = await Promise.all([
        fetch('/api/analytics/overview'),
        fetch('/api/analytics/spending'),
      ])

      if (overviewRes.ok) {
        const overviewData = await overviewRes.json()
        setOverview(overviewData)
      }

      if (spendingRes.ok) {
        const spendingData = await spendingRes.json()
        setSpending(spendingData)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (!authLoading && user) {
      fetchAnalytics()
    }
  }, [authLoading, user, router, fetchAnalytics])

  if (authLoading || loading) {
    return <PageLoader />
  }

  if (!user) {
    return null
  }

  // Prepare chart data
  const spendingTrendData = spending?.months.map((m) => ({
    month: m.month,
    total: m.total,
  })) || []

  // Current month category data for pie chart
  const currentMonthData = spending?.months[spending.months.length - 1]
  const categoryPieData = currentMonthData
    ? Object.entries(currentMonthData.categories).map(([name, value]) => ({
        name,
        value,
      }))
    : []

  // Month comparison: this month vs last month
  const thisMonthCategories = currentMonthData?.categories || {}
  const lastMonthData = spending?.months.length && spending.months.length >= 2
    ? spending.months[spending.months.length - 2]
    : null
  const lastMonthCategories = lastMonthData?.categories || {}

  // Daily spending
  const dailyData = spending?.daily || []

  // Income vs Expense
  const incomeVsExpenseData = spending?.incomeVsExpense || []

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Analytics
        </h1>

        <KpiCards
          totalIncome={overview?.totalIncome || 0}
          totalExpenses={overview?.totalExpenses || 0}
          netSavings={overview?.netSavings || 0}
          savingsRate={overview?.savingsRate || 0}
          monthOverMonthChange={overview?.monthOverMonthChange || 0}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <SpendingTrendChart data={spendingTrendData} />
          <CategoryPieChart data={categoryPieData} />
          <IncomeVsExpenseChart data={incomeVsExpenseData} />
          <MonthComparisonChart
            thisMonth={thisMonthCategories}
            lastMonth={lastMonthCategories}
          />
          <DailySpendingChart data={dailyData} />
        </div>
      </main>
    </div>
  )
}
