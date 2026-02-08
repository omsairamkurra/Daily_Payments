'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import PageLoader from '@/components/ui/PageLoader'
import Spinner from '@/components/ui/Spinner'
import { useSettings } from '@/lib/settings-context'
import { useTheme } from '@/lib/theme-context'

const currencyOptions = [
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
]

const localeMap: Record<string, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { settings, loading: settingsLoading, updateSettings } = useSettings()
  const { theme, toggleTheme } = useTheme()

  const [displayName, setDisplayName] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [spendingAlertEnabled, setSpendingAlertEnabled] = useState(true)
  const [weeklySummaryEnabled, setWeeklySummaryEnabled] = useState(false)
  const [monthlyBudgetAlertThreshold, setMonthlyBudgetAlertThreshold] = useState(80)

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPreferences, setSavingPreferences] = useState(false)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [preferencesSaved, setPreferencesSaved] = useState(false)
  const [notificationsSaved, setNotificationsSaved] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!settingsLoading) {
      setDisplayName(settings.displayName)
      setCurrency(settings.currency)
      setSpendingAlertEnabled(settings.spendingAlertEnabled)
      setWeeklySummaryEnabled(settings.weeklySummaryEnabled)
      setMonthlyBudgetAlertThreshold(settings.monthlyBudgetAlertThreshold)
    }
  }, [settingsLoading, settings])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setProfileSaved(false)
    await updateSettings({ displayName })
    setSavingProfile(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  const handleSavePreferences = async () => {
    setSavingPreferences(true)
    setPreferencesSaved(false)
    const locale = localeMap[currency] || 'en-IN'
    await updateSettings({ currency, locale, theme })
    setSavingPreferences(false)
    setPreferencesSaved(true)
    setTimeout(() => setPreferencesSaved(false), 2000)
  }

  const handleSaveNotifications = async () => {
    setSavingNotifications(true)
    setNotificationsSaved(false)
    await updateSettings({
      spendingAlertEnabled,
      weeklySummaryEnabled,
      monthlyBudgetAlertThreshold,
    })
    setSavingNotifications(false)
    setNotificationsSaved(true)
    setTimeout(() => setNotificationsSaved(false), 2000)
  }

  if (authLoading || settingsLoading) {
    return <PageLoader />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Settings
        </h1>

        <div className="space-y-6 max-w-2xl">
          {/* Profile Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email || ''}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Email cannot be changed here. It is linked to your login account.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                >
                  {savingProfile ? <Spinner size="sm" className="text-white" /> : 'Save Profile'}
                </button>
                {profileSaved && (
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Saved!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Preferences
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  {currencyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Dark Mode
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Toggle between light and dark theme
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSavePreferences}
                  disabled={savingPreferences}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                >
                  {savingPreferences ? <Spinner size="sm" className="text-white" /> : 'Save Preferences'}
                </button>
                {preferencesSaved && (
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Saved!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Spending Alerts
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get email alerts when spending approaches your budget limit
                  </p>
                </div>
                <button
                  onClick={() => setSpendingAlertEnabled(!spendingAlertEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    spendingAlertEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      spendingAlertEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {spendingAlertEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget Alert Threshold: {monthlyBudgetAlertThreshold}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={monthlyBudgetAlertThreshold}
                    onChange={(e) => setMonthlyBudgetAlertThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Alert when monthly spending reaches {monthlyBudgetAlertThreshold}% of your budget
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Weekly Summary
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Receive a weekly email summary of your spending
                  </p>
                </div>
                <button
                  onClick={() => setWeeklySummaryEnabled(!weeklySummaryEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    weeklySummaryEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      weeklySummaryEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveNotifications}
                  disabled={savingNotifications}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                >
                  {savingNotifications ? <Spinner size="sm" className="text-white" /> : 'Save Notifications'}
                </button>
                {notificationsSaved && (
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Saved!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
