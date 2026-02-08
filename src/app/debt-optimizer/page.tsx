'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import PageLoader from '@/components/ui/PageLoader'
import DebtSummaryCards from '@/components/debt/DebtSummaryCards'
import StrategyComparison from '@/components/debt/StrategyComparison'
import ExtraPaymentSimulator from '@/components/debt/ExtraPaymentSimulator'
import { calculateAvalanchePayoff, calculateSnowballPayoff } from '@/lib/financial-math'

const PayoffTimeline = dynamic(() => import('@/components/debt/PayoffTimeline'), {
  ssr: false,
  loading: () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6 h-80 flex items-center justify-center">
      <p className="text-gray-400 dark:text-gray-500">Loading chart...</p>
    </div>
  ),
})

interface Loan {
  id: string
  name: string
  lender: string
  principalAmount: number
  interestRate: number
  tenureMonths: number
  emiAmount: number
  startDate: string
  remainingAmount: number
  isActive: boolean
}

export default function DebtOptimizerPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [extraMonthly, setExtraMonthly] = useState(0)

  const fetchLoans = useCallback(async () => {
    try {
      const response = await fetch('/api/debt-optimizer')
      if (response.ok) {
        const data = await response.json()
        setLoans(data)
      }
    } catch (error) {
      console.error('Failed to fetch loans:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (!authLoading && user) {
      fetchLoans()
    }
  }, [authLoading, user, router, fetchLoans])

  // Map loans for the financial math functions
  const loanInputs = useMemo(() => {
    return loans.map((l) => ({
      id: l.id,
      remainingAmount: l.remainingAmount,
      interestRate: l.interestRate,
      emiAmount: l.emiAmount,
    }))
  }, [loans])

  // Calculate strategies
  const { avalanche, snowball, totalDebt, monthlyEmi } = useMemo(() => {
    if (loanInputs.length === 0) {
      return {
        avalanche: { totalInterest: 0, months: 0, schedule: [] },
        snowball: { totalInterest: 0, months: 0, schedule: [] },
        totalDebt: 0,
        monthlyEmi: 0,
      }
    }

    const avalancheResult = calculateAvalanchePayoff(loanInputs, extraMonthly)
    const snowballResult = calculateSnowballPayoff(loanInputs, extraMonthly)
    const totalDebt = loanInputs.reduce((sum, l) => sum + l.remainingAmount, 0)
    const monthlyEmi = loanInputs.reduce((sum, l) => sum + l.emiAmount, 0)

    return {
      avalanche: avalancheResult,
      snowball: snowballResult,
      totalDebt,
      monthlyEmi,
    }
  }, [loanInputs, extraMonthly])

  // Use the better (lower interest) strategy for the summary
  const bestInterest = Math.min(avalanche.totalInterest, snowball.totalInterest)
  const bestMonths = avalanche.totalInterest <= snowball.totalInterest
    ? avalanche.months
    : snowball.months

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Debt Payoff Optimizer
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Compare strategies and find the fastest way to become debt-free
          </p>
        </div>

        {loans.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No Active Loans Found
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Add active loans in the Loans section to start optimizing your debt payoff strategy.
            </p>
            <button
              onClick={() => router.push('/loans')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Loans
            </button>
          </div>
        ) : (
          <>
            <DebtSummaryCards
              totalDebt={totalDebt}
              monthlyEmi={monthlyEmi}
              totalInterest={bestInterest}
              payoffMonths={bestMonths}
            />

            <ExtraPaymentSimulator
              loans={loanInputs}
              onExtraChange={setExtraMonthly}
              extraMonthly={extraMonthly}
            />

            <StrategyComparison
              loans={loanInputs}
              extraMonthly={extraMonthly}
            />

            <PayoffTimeline
              avalancheSchedule={avalanche.schedule}
              snowballSchedule={snowball.schedule}
            />
          </>
        )}
      </main>
    </div>
  )
}
