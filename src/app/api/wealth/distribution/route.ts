import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const TYPE_LABELS: Record<string, string> = {
  mutual_fund: 'Mutual Funds',
  stock: 'Stocks',
  sip: 'SIP',
  fd: 'Fixed Deposits',
  ppf: 'PPF',
  gold: 'Gold',
  silver: 'Silver',
  other: 'Other Investments',
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch investments, savings goals, and loans in parallel
    const [investmentsResult, goalsResult, loansResult] = await Promise.all([
      supabase
        .from('investments')
        .select('type, invested_amount, current_value')
        .eq('user_id', user.id),
      supabase
        .from('savings_goals')
        .select('saved_amount')
        .eq('user_id', user.id),
      supabase
        .from('loans')
        .select('loan_amount, emi_amount, paid_emis, tenure_months')
        .eq('user_id', user.id),
    ])

    if (investmentsResult.error) {
      console.error('Error fetching investments:', investmentsResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch investments' },
        { status: 500 }
      )
    }

    if (goalsResult.error) {
      console.error('Error fetching goals:', goalsResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch savings goals' },
        { status: 500 }
      )
    }

    if (loansResult.error) {
      console.error('Error fetching loans:', loansResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch loans' },
        { status: 500 }
      )
    }

    const investments = investmentsResult.data || []
    const goals = goalsResult.data || []
    const loans = loansResult.data || []

    // Group investments by type and sum values
    const byType: Record<string, number> = {}
    let investmentTotal = 0

    for (const inv of investments) {
      const value = inv.current_value ?? inv.invested_amount ?? 0
      const type = inv.type || 'other'
      byType[type] = (byType[type] || 0) + Number(value)
      investmentTotal += Number(value)
    }

    // Total savings from savings goals
    const savingsTotal = goals.reduce(
      (sum, goal) => sum + Number(goal.saved_amount || 0),
      0
    )

    // Total remaining loan amount (liability)
    const loansTotal = loans.reduce((sum, loan) => {
      const totalAmount = Number(loan.loan_amount || 0)
      const paidEmis = Number(loan.paid_emis || 0)
      const emiAmount = Number(loan.emi_amount || 0)
      const remainingAmount = Math.max(0, totalAmount - paidEmis * emiAmount)
      return sum + remainingAmount
    }, 0)

    const totalAssets = investmentTotal + savingsTotal
    const netWorth = totalAssets - loansTotal

    // Build allocation array (investments by type + savings)
    const allocation: Array<{ name: string; value: number; percentage: number }> = []

    for (const [type, value] of Object.entries(byType)) {
      if (value > 0) {
        allocation.push({
          name: TYPE_LABELS[type] || type,
          value,
          percentage: totalAssets > 0 ? (value / totalAssets) * 100 : 0,
        })
      }
    }

    if (savingsTotal > 0) {
      allocation.push({
        name: 'Savings',
        value: savingsTotal,
        percentage: totalAssets > 0 ? (savingsTotal / totalAssets) * 100 : 0,
      })
    }

    // Sort by value descending
    allocation.sort((a, b) => b.value - a.value)

    return NextResponse.json({
      assets: {
        investments: {
          byType,
          total: investmentTotal,
        },
        savings: savingsTotal,
      },
      liabilities: {
        loans: loansTotal,
      },
      netWorth,
      allocation,
    })
  } catch (error) {
    console.error('Error fetching wealth distribution:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wealth distribution' },
      { status: 500 }
    )
  }
}
