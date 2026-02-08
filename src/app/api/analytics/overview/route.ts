import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0]
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0]

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toISOString()
      .split('T')[0]
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      .toISOString()
      .split('T')[0]

    // Fetch current month expenses
    const { data: currentExpenses, error: expError } = await supabase
      .from('payments')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', currentMonthStart)
      .lte('date', currentMonthEnd)

    if (expError) {
      console.error('Error fetching current expenses:', expError)
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      )
    }

    // Fetch last month expenses
    const { data: lastExpenses, error: lastExpError } = await supabase
      .from('payments')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', lastMonthStart)
      .lte('date', lastMonthEnd)

    if (lastExpError) {
      console.error('Error fetching last month expenses:', lastExpError)
    }

    // Fetch current month income
    const { data: currentIncome, error: incError } = await supabase
      .from('income_entries')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', currentMonthStart)
      .lte('date', currentMonthEnd)

    if (incError) {
      console.error('Error fetching current income:', incError)
    }

    // Fetch last month income
    const { data: lastIncome, error: lastIncError } = await supabase
      .from('income_entries')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', lastMonthStart)
      .lte('date', lastMonthEnd)

    if (lastIncError) {
      console.error('Error fetching last month income:', lastIncError)
    }

    // Calculate totals
    const totalExpenses = (currentExpenses || []).reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    )
    const totalIncome = (currentIncome || []).reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    )
    const netSavings = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0
      ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100 * 100) / 100
      : 0

    // Last month totals for comparison
    const lastMonthTotalExpenses = (lastExpenses || []).reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    )
    const lastMonthTotalIncome = (lastIncome || []).reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    )
    const lastMonthNetSavings = lastMonthTotalIncome - lastMonthTotalExpenses

    // Month-over-month change in expenses
    const monthOverMonthChange = lastMonthTotalExpenses > 0
      ? Math.round(((totalExpenses - lastMonthTotalExpenses) / lastMonthTotalExpenses) * 100 * 100) / 100
      : 0

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      monthOverMonthChange,
      lastMonthTotalExpenses,
      lastMonthTotalIncome,
      lastMonthNetSavings,
    })
  } catch (error) {
    console.error('Error fetching analytics overview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
