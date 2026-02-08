'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import PageLoader from '@/components/ui/PageLoader'
import RefreshButton from '@/components/ui/RefreshButton'
import PortfolioKpiCards from '@/components/portfolio/PortfolioKpiCards'
import InvestmentBreakdownChart from '@/components/portfolio/InvestmentBreakdownChart'
import AppAllocationChart from '@/components/portfolio/AppAllocationChart'
import PerformanceTable from '@/components/portfolio/PerformanceTable'

const GrowthChart = dynamic(
  () => import('@/components/portfolio/GrowthChart'),
  { ssr: false }
)

interface InvestmentData {
  id: string
  name: string
  type: string
  app: string
  invested: number
  current: number
  gainLoss: number
  gainLossPercent: number
  cagr: number
  purchaseDate: string
}

interface ByTypeData {
  type: string
  invested: number
  current: number
  gainLoss: number
  percentage: number
  count: number
}

interface ByAppData {
  app: string
  invested: number
  current: number
  gainLoss: number
  count: number
}

interface PortfolioData {
  totalInvested: number
  totalCurrentValue: number
  overallGainLoss: number
  overallGainLossPercent: number
  byType: ByTypeData[]
  byApp: ByAppData[]
  investments: InvestmentData[]
  bestPerformer: { name: string; gainLossPercent: number } | null
  worstPerformer: { name: string; gainLossPercent: number } | null
}

export default function PortfolioPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const fetchAnalysis = useCallback(async () => {
    try {
      setError('')
      const response = await fetch('/api/portfolio/analysis')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      } else {
        setError('Failed to fetch portfolio analysis')
      }
    } catch (err) {
      console.error('Failed to fetch portfolio analysis:', err)
      setError('Failed to fetch portfolio analysis')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (!authLoading && user) {
      fetchAnalysis()
    }
  }, [authLoading, user, router, fetchAnalysis])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalysis()
    setRefreshing(false)
  }

  // Build growth chart data from investments sorted by purchase date
  const growthChartData = useMemo(() => {
    if (!data || !data.investments || data.investments.length === 0) return []

    // Sort investments by purchase date
    const sorted = [...data.investments]
      .filter((inv) => inv.purchaseDate)
      .sort((a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime())

    if (sorted.length === 0) return []

    // Build cumulative data points per purchase date
    const dateMap = new Map<string, { invested: number; value: number }>()
    let cumulativeInvested = 0
    let cumulativeValue = 0

    sorted.forEach((inv) => {
      const dateKey = inv.purchaseDate.substring(0, 7) // YYYY-MM
      cumulativeInvested += inv.invested
      cumulativeValue += inv.current

      dateMap.set(dateKey, {
        invested: cumulativeInvested,
        value: cumulativeValue,
      })
    })

    return Array.from(dateMap.entries()).map(([date, values]) => ({
      date,
      invested: values.invested,
      value: values.value,
    }))
  }, [data])

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
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Portfolio Analysis
          </h1>
          <div className="flex gap-2">
            <RefreshButton onClick={handleRefresh} isRefreshing={refreshing} />
            <button
              onClick={() => router.push('/investments')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              Manage Investments
            </button>
          </div>
        </div>

        {data && (
          <>
            <PortfolioKpiCards
              totalInvested={data.totalInvested}
              totalCurrentValue={data.totalCurrentValue}
              overallGainLossPercent={data.overallGainLossPercent}
              bestPerformer={data.bestPerformer}
              worstPerformer={data.worstPerformer}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <InvestmentBreakdownChart
                data={data.byType.map((t) => ({
                  name: t.type,
                  value: t.invested,
                }))}
              />
              <AppAllocationChart
                data={data.byApp.map((a) => ({
                  name: a.app,
                  value: a.invested,
                }))}
              />
            </div>

            <div className="mb-6">
              <PerformanceTable investments={data.investments} />
            </div>

            <div className="mb-6">
              <GrowthChart data={growthChartData} />
            </div>
          </>
        )}

        {data && data.investments.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              No investments found. Add investments to see your portfolio analysis.
            </p>
            <button
              onClick={() => router.push('/investments')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Investments
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
