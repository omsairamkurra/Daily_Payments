'use client'

import { useState, useEffect } from 'react'

interface SipSuggestion {
  description: string
  amount: number
  occurrences: number
  intervalDays: number
}

interface SipSuggestionBannerProps {
  onCreateSip: (suggestion: SipSuggestion) => void
}

export default function SipSuggestionBanner({ onCreateSip }: SipSuggestionBannerProps) {
  const [suggestions, setSuggestions] = useState<SipSuggestion[]>([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch('/api/sip-detection')
      .then(res => res.ok ? res.json() : [])
      .then(data => setSuggestions(data))
      .catch(() => {})
  }, [])

  if (dismissed || suggestions.length === 0) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-semibold text-blue-800">SIP Patterns Detected</h3>
        <button
          onClick={() => setDismissed(true)}
          className="text-blue-400 hover:text-blue-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">{s.description}</p>
              <p className="text-xs text-gray-500">
                {formatCurrency(s.amount)} - {s.occurrences} payments every ~{s.intervalDays} days
              </p>
            </div>
            <button
              onClick={() => onCreateSip(s)}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create SIP
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
