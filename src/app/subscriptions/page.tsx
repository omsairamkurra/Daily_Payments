'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import SubscriptionForm from '@/components/SubscriptionForm'
import SubscriptionList from '@/components/SubscriptionList'
import SubscriptionView from '@/components/SubscriptionView'
import SubscriptionSummaryCard from '@/components/SubscriptionSummaryCard'
import ZombieAlertBanner from '@/components/ZombieAlertBanner'
import PageLoader from '@/components/ui/PageLoader'
import RefreshButton from '@/components/ui/RefreshButton'
import Spinner from '@/components/ui/Spinner'

interface Subscription {
  id: string
  name: string
  amount: number
  frequency: string
  category: string
  provider: string
  startDate: string
  nextRenewalDate: string
  isActive: boolean
  lastUsedDate: string | null
  autoDetected: boolean
}

interface DetectedSubscription {
  name: string
  amount: number
  frequency: string
  source: string
  category: string | null
  provider: string | null
}

export default function SubscriptionsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [viewingSubscription, setViewingSubscription] = useState<Subscription | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [detectedSubscriptions, setDetectedSubscriptions] = useState<DetectedSubscription[]>([])
  const [detecting, setDetecting] = useState(false)
  const [showDetected, setShowDetected] = useState(false)

  const fetchSubscriptions = useCallback(async () => {
    try {
      const response = await fetch('/api/subscriptions')
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data)
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (!authLoading && user) {
      fetchSubscriptions()
    }
  }, [authLoading, user, router, fetchSubscriptions])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchSubscriptions()
    setRefreshing(false)
  }

  const handleDetect = async () => {
    try {
      setDetecting(true)
      const response = await fetch('/api/subscriptions/detect', {
        method: 'POST',
      })
      if (response.ok) {
        const data = await response.json()
        setDetectedSubscriptions(data)
        setShowDetected(true)
      }
    } catch (error) {
      console.error('Failed to detect subscriptions:', error)
    } finally {
      setDetecting(false)
    }
  }

  const handleAddDetected = async (detected: DetectedSubscription) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: detected.name,
          amount: detected.amount,
          frequency: detected.frequency,
          category: detected.category || '',
          provider: detected.provider || '',
          startDate: today,
          nextRenewalDate: today,
          isActive: true,
          autoDetected: true,
        }),
      })

      if (response.ok) {
        setDetectedSubscriptions((prev) =>
          prev.filter((d) => !(d.name === detected.name && d.amount === detected.amount))
        )
        fetchSubscriptions()
      }
    } catch (error) {
      console.error('Failed to add detected subscription:', error)
    }
  }

  const handleAdd = async (data: Omit<Subscription, 'id' | 'autoDetected'>) => {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setShowForm(false)
        fetchSubscriptions()
      }
    } catch (error) {
      console.error('Failed to add subscription:', error)
    }
  }

  const handleEdit = async (data: Omit<Subscription, 'id' | 'autoDetected'>) => {
    if (!editingSubscription) return

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingSubscription.id, ...data }),
      })

      if (response.ok) {
        setEditingSubscription(null)
        fetchSubscriptions()
      }
    } catch (error) {
      console.error('Failed to update subscription:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/subscriptions?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchSubscriptions()
      }
    } catch (error) {
      console.error('Failed to delete subscription:', error)
    }
  }

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
            Subscriptions
          </h1>
          <div className="flex gap-2">
            <RefreshButton onClick={handleRefresh} isRefreshing={refreshing} />
            <button
              onClick={handleDetect}
              disabled={detecting}
              className="px-4 md:px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm md:text-base disabled:opacity-50 flex items-center gap-2"
            >
              {detecting && <Spinner size="sm" className="text-white" />}
              Auto-Detect
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm md:text-base"
            >
              Add Subscription
            </button>
          </div>
        </div>

        {/* Summary Card */}
        {subscriptions.length > 0 && (
          <SubscriptionSummaryCard subscriptions={subscriptions} />
        )}

        {/* Zombie Alert Banner */}
        <ZombieAlertBanner subscriptions={subscriptions} />

        {/* Auto-detect results banner */}
        {showDetected && detectedSubscriptions.length > 0 && (
          <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                {detectedSubscriptions.length} potential subscription{detectedSubscriptions.length !== 1 ? 's' : ''} detected
              </h3>
              <button
                onClick={() => setShowDetected(false)}
                className="text-purple-400 dark:text-purple-500 hover:text-purple-600 dark:hover:text-purple-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {detectedSubscriptions.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{d.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {'\u20B9'}{d.amount.toFixed(2)} - {d.frequency} (from {d.source})
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddDetected(d)}
                    className="px-3 py-1 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {showDetected && detectedSubscriptions.length === 0 && !detecting && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-green-800 dark:text-green-200">
                No new subscriptions detected. All your subscriptions are already tracked!
              </p>
              <button
                onClick={() => setShowDetected(false)}
                className="text-green-400 dark:text-green-500 hover:text-green-600 dark:hover:text-green-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <SubscriptionList
          subscriptions={subscriptions}
          onView={(item) => setViewingSubscription(item)}
          onEdit={(item) => setEditingSubscription(item)}
          onDelete={handleDelete}
        />
      </main>

      {showForm && (
        <SubscriptionForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingSubscription && (
        <SubscriptionForm
          subscription={editingSubscription}
          onSubmit={handleEdit}
          onCancel={() => setEditingSubscription(null)}
        />
      )}

      {viewingSubscription && (
        <SubscriptionView
          subscription={viewingSubscription}
          onClose={() => setViewingSubscription(null)}
          onEdit={() => {
            setEditingSubscription(viewingSubscription)
            setViewingSubscription(null)
          }}
        />
      )}
    </div>
  )
}
