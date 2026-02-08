'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Alert {
  id: string
  alertType: string
  title: string
  message: string
  severity: 'info' | 'warning' | 'critical'
  isRead: boolean
  relatedCategory: string | null
  relatedAmount: number | null
  createdAt: string
}

function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

function SeverityIcon({ severity }: { severity: Alert['severity'] }) {
  if (severity === 'critical') {
    return (
      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    )
  }
  if (severity === 'warning') {
    return (
      <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
  return (
    <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export default function AlertBell() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/alerts')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    }
  }, [])

  const generateAlerts = useCallback(async () => {
    try {
      await fetch('/api/alerts/generate', { method: 'POST' })
      await fetchAlerts()
    } catch (error) {
      console.error('Failed to generate alerts:', error)
    }
  }, [fetchAlerts])

  useEffect(() => {
    // Generate + fetch alerts on mount
    setLoading(true)
    generateAlerts().finally(() => setLoading(false))

    // Refresh every 5 minutes
    const interval = setInterval(() => {
      generateAlerts()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [generateAlerts])

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'all' }),
      })
      if (response.ok) {
        setAlerts([])
        setOpen(false)
      }
    } catch (error) {
      console.error('Failed to mark alerts as read:', error)
    }
  }

  const handleMarkRead = async (id: string) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (response.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== id))
      }
    } catch (error) {
      console.error('Failed to mark alert as read:', error)
    }
  }

  const unreadCount = alerts.length

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Alerts"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Spending Alerts
            </h3>
            {unreadCount > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {unreadCount} unread
              </span>
            )}
          </div>

          {/* Alert list */}
          <div className="overflow-y-auto flex-1">
            {loading && alerts.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <svg className="animate-spin w-6 h-6 text-blue-600 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">Checking alerts...</p>
              </div>
            ) : alerts.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <svg className="w-10 h-10 text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">No alerts right now</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Your spending looks good!</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer group"
                  onClick={() => handleMarkRead(alert.id)}
                >
                  <div className="flex gap-3">
                    <SeverityIcon severity={alert.severity} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {alert.title}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkRead(alert.id)
                          }}
                          className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Dismiss"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {timeAgo(alert.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {unreadCount > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <button
                onClick={handleMarkAllRead}
                className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium py-1 transition-colors"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
