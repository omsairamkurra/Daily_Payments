'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import PageLoader from '@/components/ui/PageLoader'
import RefreshButton from '@/components/ui/RefreshButton'
import Spinner from '@/components/ui/Spinner'
import AssetLiabilityBar from '@/components/networth/AssetLiabilityBar'
import ManualAssetForm from '@/components/networth/ManualAssetForm'
import ManualAssetList from '@/components/networth/ManualAssetList'

const NetWorthTrendChart = dynamic(
  () => import('@/components/networth/NetWorthTrendChart'),
  { ssr: false }
)
const BreakdownPie = dynamic(
  () => import('@/components/networth/BreakdownPie'),
  { ssr: false }
)

interface ManualAsset {
  id: string
  name: string
  category: string
  estimatedValue: number
  purchaseDate: string | null
  notes: string | null
}

interface NetWorthData {
  current: {
    totalAssets: number
    totalLiabilities: number
    netWorth: number
    breakdown: Record<string, number>
    investmentTotal: number
    savingsTotal: number
    manualAssetsTotal: number
    loansTotal: number
  }
  history: Array<{
    id: string
    date: string
    totalAssets: number
    totalLiabilities: number
    netWorth: number
  }>
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function NetWorthPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [netWorthData, setNetWorthData] = useState<NetWorthData | null>(null)
  const [assets, setAssets] = useState<ManualAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAssetForm, setShowAssetForm] = useState(false)
  const [editingAsset, setEditingAsset] = useState<ManualAsset | null>(null)
  const [snapshotting, setSnapshotting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const [netWorthRes, assetsRes] = await Promise.all([
        fetch('/api/net-worth'),
        fetch('/api/net-worth/assets'),
      ])

      if (netWorthRes.ok) {
        const data = await netWorthRes.json()
        setNetWorthData(data)
      } else {
        setError('Failed to fetch net worth data')
      }

      if (assetsRes.ok) {
        const data = await assetsRes.json()
        setAssets(data)
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (!authLoading && user) {
      fetchData()
    }
  }, [authLoading, user, router, fetchData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  const handleTakeSnapshot = async () => {
    setSnapshotting(true)
    setSuccessMessage('')
    try {
      const response = await fetch('/api/net-worth', {
        method: 'POST',
      })

      if (response.ok) {
        setSuccessMessage('Snapshot saved successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
        await fetchData()
      } else {
        setError('Failed to take snapshot')
      }
    } catch (err) {
      console.error('Failed to take snapshot:', err)
      setError('Failed to take snapshot')
    } finally {
      setSnapshotting(false)
    }
  }

  const handleAddAsset = async (data: {
    name: string
    category: string
    estimatedValue: number
    purchaseDate: string | null
    notes: string | null
  }) => {
    try {
      const response = await fetch('/api/net-worth/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setShowAssetForm(false)
        fetchData()
      }
    } catch (err) {
      console.error('Failed to add asset:', err)
    }
  }

  const handleEditAsset = async (data: {
    name: string
    category: string
    estimatedValue: number
    purchaseDate: string | null
    notes: string | null
  }) => {
    if (!editingAsset) return

    try {
      const response = await fetch('/api/net-worth/assets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingAsset.id, ...data }),
      })

      if (response.ok) {
        setEditingAsset(null)
        fetchData()
      }
    } catch (err) {
      console.error('Failed to update asset:', err)
    }
  }

  const handleDeleteAsset = async (id: string) => {
    try {
      const response = await fetch(`/api/net-worth/assets?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchData()
      }
    } catch (err) {
      console.error('Failed to delete asset:', err)
    }
  }

  if (authLoading || loading) {
    return <PageLoader />
  }

  if (!user) {
    return null
  }

  const current = netWorthData?.current
  const history = netWorthData?.history || []

  // Prepare chart data from snapshots
  const trendData = history.map((s) => ({
    date: s.date,
    netWorth: s.netWorth,
    assets: s.totalAssets,
    liabilities: s.totalLiabilities,
  }))

  // Prepare breakdown data for pie chart
  const breakdownData = current
    ? Object.entries(current.breakdown)
        .filter(([, value]) => value > 0)
        .map(([name, value]) => ({ name, value }))
    : []

  // Calculate change from last snapshot
  let changeAmount = 0
  let changePercent = 0
  if (history.length >= 2 && current) {
    const prevSnapshot = history[history.length - 1]
    // Compare current calculated net worth with the most recent snapshot
    if (prevSnapshot.netWorth !== 0) {
      changeAmount = current.netWorth - prevSnapshot.netWorth
      changePercent = (changeAmount / Math.abs(prevSnapshot.netWorth)) * 100
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Net Worth Tracker
          </h1>
          <div className="flex gap-2">
            <RefreshButton onClick={handleRefresh} isRefreshing={refreshing} />
            <button
              onClick={handleTakeSnapshot}
              disabled={snapshotting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {snapshotting && <Spinner size="sm" className="text-white" />}
              Take Snapshot
            </button>
          </div>
        </div>

        {/* Net Worth Summary Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Current Net Worth
            </p>
            <p
              className={`text-4xl font-bold mb-2 ${
                (current?.netWorth ?? 0) >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatCurrency(current?.netWorth ?? 0)}
            </p>
            {history.length >= 2 && (
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  changeAmount >= 0
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                }`}
              >
                <span>
                  {changeAmount >= 0 ? '+' : ''}
                  {formatCurrency(changeAmount)}
                </span>
                <span className="text-xs">
                  ({changePercent >= 0 ? '+' : ''}
                  {changePercent.toFixed(1)}%)
                </span>
                <span className="text-xs opacity-75">since last snapshot</span>
              </div>
            )}
          </div>

          {/* Mini breakdown row */}
          {current && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Investments</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(current.investmentTotal)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Savings</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(current.savingsTotal)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Other Assets</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(current.manualAssetsTotal)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Loans</p>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(current.loansTotal)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Assets vs Liabilities Bar */}
        <div className="mb-6">
          <AssetLiabilityBar
            assets={current?.totalAssets ?? 0}
            liabilities={current?.totalLiabilities ?? 0}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <NetWorthTrendChart data={trendData} />
          <BreakdownPie data={breakdownData} />
        </div>

        {/* Manual Assets Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Manual Assets
            </h2>
            <button
              onClick={() => setShowAssetForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Add Asset
            </button>
          </div>

          <ManualAssetList
            assets={assets}
            onEdit={(asset) => setEditingAsset(asset)}
            onDelete={handleDeleteAsset}
          />
        </div>
      </main>

      {/* Modals */}
      {showAssetForm && (
        <ManualAssetForm
          onSubmit={handleAddAsset}
          onCancel={() => setShowAssetForm(false)}
        />
      )}

      {editingAsset && (
        <ManualAssetForm
          asset={editingAsset}
          onSubmit={handleEditAsset}
          onCancel={() => setEditingAsset(null)}
        />
      )}
    </div>
  )
}
