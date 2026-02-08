'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/app/providers'

interface UserSettings {
  currency: string
  locale: string
  theme: string
  monthlyBudgetAlertThreshold: number
  spendingAlertEnabled: boolean
  weeklySummaryEnabled: boolean
  displayName: string
}

interface SettingsContextType {
  settings: UserSettings
  loading: boolean
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>
  formatCurrency: (amount: number) => string
}

const defaultSettings: UserSettings = {
  currency: 'INR',
  locale: 'en-IN',
  theme: 'light',
  monthlyBudgetAlertThreshold: 80,
  spendingAlertEnabled: true,
  weeklySummaryEnabled: false,
  displayName: '',
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  updateSettings: async () => {},
  formatCurrency: (amount) => `₹${amount}`,
})

export const useSettings = () => useContext(SettingsContext)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchSettings()
    } else {
      setLoading(false)
    }
  }, [user, fetchSettings])

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  }

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat(settings.locale, {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }, [settings.locale, settings.currency])

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, formatCurrency }}>
      {children}
    </SettingsContext.Provider>
  )
}
