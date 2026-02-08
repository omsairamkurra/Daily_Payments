'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/app/providers'
import PageLoader from '@/components/ui/PageLoader'

const SipCalculator = dynamic(() => import('@/components/calculators/SipCalculator'), { ssr: false })
const LumpSumCalculator = dynamic(() => import('@/components/calculators/LumpSumCalculator'), { ssr: false })
const CagrCalculator = dynamic(() => import('@/components/calculators/CagrCalculator'), { ssr: false })

type Tab = 'sip' | 'lumpsum' | 'cagr'

export default function CalculatorsPage() {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('sip')

  if (authLoading) {
    return <PageLoader />
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'sip', label: 'SIP Calculator' },
    { key: 'lumpsum', label: 'Lump Sum' },
    { key: 'cagr', label: 'CAGR' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Investment Calculators</h1>

        {/* Tab Bar */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Calculator Content */}
        {activeTab === 'sip' && <SipCalculator />}
        {activeTab === 'lumpsum' && <LumpSumCalculator />}
        {activeTab === 'cagr' && <CagrCalculator />}
      </main>
    </div>
  )
}
