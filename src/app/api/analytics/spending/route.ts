import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate date range: last 6 months
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const startDate = sixMonthsAgo.toISOString().split('T')[0]

    // Fetch all payments in the last 6 months
    const { data: payments, error } = await supabase
      .from('payments')
      .select('date, amount, category')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching spending data:', error)
      return NextResponse.json(
        { error: 'Failed to fetch spending data' },
        { status: 500 }
      )
    }

    // Also fetch daily spending for current month
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0]

    const { data: dailyPayments, error: dailyError } = await supabase
      .from('payments')
      .select('date, amount')
      .eq('user_id', user.id)
      .gte('date', currentMonthStart)
      .order('date', { ascending: true })

    if (dailyError) {
      console.error('Error fetching daily spending:', dailyError)
    }

    // Group payments by month and category
    const monthMap: Record<string, { categories: Record<string, number>; total: number }> = {}

    // Initialize all 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthMap[monthKey] = { categories: {}, total: 0 }
    }

    // Populate with payment data
    for (const payment of payments || []) {
      const paymentDate = new Date(payment.date)
      const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`

      if (monthMap[monthKey]) {
        const category = payment.category || 'Uncategorized'
        const amount = Number(payment.amount) || 0

        monthMap[monthKey].categories[category] = (monthMap[monthKey].categories[category] || 0) + amount
        monthMap[monthKey].total += amount
      }
    }

    // Build daily spending data for current month
    const dailyMap: Record<string, number> = {}
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      dailyMap[dayStr] = 0
    }

    for (const payment of dailyPayments || []) {
      const dayStr = payment.date.split('T')[0]
      if (dailyMap[dayStr] !== undefined) {
        dailyMap[dayStr] += Number(payment.amount) || 0
      }
    }

    const months = Object.entries(monthMap).map(([month, data]) => ({
      month,
      categories: data.categories,
      total: data.total,
    }))

    const daily = Object.entries(dailyMap).map(([day, amount]) => ({
      day,
      amount,
    }))

    // Fetch income data for the last 6 months for income vs expense chart
    const { data: incomeEntries, error: incomeError } = await supabase
      .from('income_entries')
      .select('date, amount')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .order('date', { ascending: true })

    if (incomeError) {
      console.error('Error fetching income data:', incomeError)
    }

    // Group income by month
    const incomeByMonth: Record<string, number> = {}
    for (const entry of incomeEntries || []) {
      const entryDate = new Date(entry.date)
      const monthKey = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`
      incomeByMonth[monthKey] = (incomeByMonth[monthKey] || 0) + (Number(entry.amount) || 0)
    }

    const incomeVsExpense = months.map((m) => ({
      month: m.month,
      income: incomeByMonth[m.month] || 0,
      expenses: m.total,
    }))

    return NextResponse.json({ months, daily, incomeVsExpense })
  } catch (error) {
    console.error('Error fetching analytics spending:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
