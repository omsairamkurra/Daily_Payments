import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminSupabaseClient()

    // Get all distinct user IDs from payments
    const { data: users, error: usersError } = await supabase
      .from('payments')
      .select('user_id')
      .limit(1000) as { data: any[] | null; error: any }

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Deduplicate user IDs
    const userIds = Array.from(new Set((users || []).map((u: any) => u.user_id)))

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
    const threeMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 3, 1)
      .toISOString()
      .split('T')[0]

    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    let totalInserts = 0

    for (const userId of userIds) {
      const insights: Array<{
        user_id: string
        insight_type: string
        title: string
        description: string
        data: Record<string, unknown>
        period: string
        is_dismissed: boolean
      }> = []

      // Fetch current month, last month, and 3-month payments
      const [currentMonthResult, lastMonthResult, threeMonthResult, budgetsResult] =
        await Promise.all([
          supabase
            .from('payments')
            .select('amount, category, date')
            .eq('user_id', userId)
            .gte('date', currentMonthStart)
            .lte('date', currentMonthEnd) as unknown as Promise<{ data: any[] | null; error: any }>,
          supabase
            .from('payments')
            .select('amount, category, date')
            .eq('user_id', userId)
            .gte('date', lastMonthStart)
            .lte('date', lastMonthEnd) as unknown as Promise<{ data: any[] | null; error: any }>,
          supabase
            .from('payments')
            .select('amount, category, date')
            .eq('user_id', userId)
            .gte('date', threeMonthsAgoStart)
            .lte('date', lastMonthEnd) as unknown as Promise<{ data: any[] | null; error: any }>,
          supabase
            .from('budgets')
            .select('category, amount')
            .eq('user_id', userId) as unknown as Promise<{ data: any[] | null; error: any }>,
        ])

      const currentPayments = (currentMonthResult.data || []) as any[]
      const lastPayments = (lastMonthResult.data || []) as any[]
      const threeMonthPayments = (threeMonthResult.data || []) as any[]
      const budgets = (budgetsResult.data || []) as any[]

      const currentTotal = currentPayments.reduce(
        (sum: number, p: any) => sum + Number(p.amount || 0),
        0
      )
      const lastTotal = lastPayments.reduce(
        (sum: number, p: any) => sum + Number(p.amount || 0),
        0
      )

      // 1. Month-over-month spending trend
      if (lastTotal > 0 && currentTotal > 0) {
        const changePercent = ((currentTotal - lastTotal) / lastTotal) * 100

        if (Math.abs(changePercent) >= 10) {
          const direction = changePercent > 0 ? 'increased' : 'decreased'
          const formatAmount = (amt: number) =>
            new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              minimumFractionDigits: 0,
            }).format(amt)

          insights.push({
            user_id: userId,
            insight_type: 'trend',
            title: `Spending ${direction} by ${Math.abs(changePercent).toFixed(0)}%`,
            description: `Your spending this month (${formatAmount(currentTotal)}) has ${direction} compared to last month (${formatAmount(lastTotal)}).`,
            data: {
              currentTotal,
              lastTotal,
              changePercent: Math.round(changePercent * 10) / 10,
            },
            period,
            is_dismissed: false,
          })
        }
      }

      // 2. Category spike detection
      const currentByCategory: Record<string, number> = {}
      for (const p of currentPayments) {
        const cat = p.category || 'uncategorized'
        currentByCategory[cat] = (currentByCategory[cat] || 0) + Number(p.amount || 0)
      }

      // 3-month average by category (excluding current month)
      const threeMonthByCategory: Record<string, number> = {}
      for (const p of threeMonthPayments) {
        const cat = p.category || 'uncategorized'
        threeMonthByCategory[cat] = (threeMonthByCategory[cat] || 0) + Number(p.amount || 0)
      }

      for (const [category, currentAmount] of Object.entries(currentByCategory)) {
        const threeMonthAvg = (threeMonthByCategory[category] || 0) / 3
        if (threeMonthAvg > 0 && currentAmount > threeMonthAvg * 1.5) {
          const spikePercent = ((currentAmount - threeMonthAvg) / threeMonthAvg) * 100
          const formatCat =
            category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ')

          insights.push({
            user_id: userId,
            insight_type: 'spike',
            title: `${formatCat} spending is ${spikePercent.toFixed(0)}% higher`,
            description: `Your ${formatCat.toLowerCase()} spending is significantly higher than your 3-month average. Consider reviewing these expenses.`,
            data: {
              category,
              currentAmount,
              threeMonthAvg: Math.round(threeMonthAvg),
              spikePercent: Math.round(spikePercent),
            },
            period,
            is_dismissed: false,
          })
        }
      }

      // 3. Saving recommendation
      for (const [category, currentAmount] of Object.entries(currentByCategory)) {
        const threeMonthAvg = (threeMonthByCategory[category] || 0) / 3
        if (threeMonthAvg > 0 && currentAmount > threeMonthAvg && currentAmount - threeMonthAvg >= 500) {
          const savingsAmount = currentAmount - threeMonthAvg
          const formatCat =
            category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ')
          const formatAmount = (amt: number) =>
            new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              minimumFractionDigits: 0,
            }).format(amt)

          // Only add if we haven't already added a spike for this category
          const alreadyHasSpike = insights.some(
            (i) => i.insight_type === 'spike' && (i.data as Record<string, unknown>).category === category
          )
          if (!alreadyHasSpike) {
            insights.push({
              user_id: userId,
              insight_type: 'recommendation',
              title: `Save ${formatAmount(savingsAmount)} on ${formatCat.toLowerCase()}`,
              description: `By reducing your ${formatCat.toLowerCase()} spending to your average, you could save ${formatAmount(savingsAmount)} this month.`,
              data: {
                category,
                currentAmount,
                averageAmount: Math.round(threeMonthAvg),
                potentialSavings: Math.round(savingsAmount),
              },
              period,
              is_dismissed: false,
            })
          }
        }
      }

      // 4. Budget streak detection
      if (budgets.length > 0) {
        let streakMonths = 0
        for (let m = 1; m <= 6; m++) {
          const checkStart = new Date(now.getFullYear(), now.getMonth() - m, 1)
            .toISOString()
            .split('T')[0]
          const checkEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 0)
            .toISOString()
            .split('T')[0]

          const { data: monthPaymentsRaw } = await supabase
            .from('payments')
            .select('amount, category')
            .eq('user_id', userId)
            .gte('date', checkStart)
            .lte('date', checkEnd) as { data: any[] | null; error: any }

          const monthPayments = (monthPaymentsRaw || []) as any[]
          if (monthPayments.length === 0) break

          const monthByCategory: Record<string, number> = {}
          for (const p of monthPayments) {
            const cat = p.category || 'uncategorized'
            monthByCategory[cat] = (monthByCategory[cat] || 0) + Number(p.amount || 0)
          }

          let withinBudget = true
          for (const budget of budgets) {
            const spent = monthByCategory[budget.category] || 0
            if (spent > Number(budget.amount)) {
              withinBudget = false
              break
            }
          }

          if (withinBudget) {
            streakMonths++
          } else {
            break
          }
        }

        if (streakMonths >= 2) {
          insights.push({
            user_id: userId,
            insight_type: 'streak',
            title: `${streakMonths}-month budget streak!`,
            description: `Great job! You've stayed within your budget for ${streakMonths} consecutive months. Keep it up!`,
            data: {
              streakMonths,
            },
            period,
            is_dismissed: false,
          })
        }
      }

      // Insert max 5 insights per user per week
      if (insights.length > 0) {
        // Delete existing non-dismissed insights from this period first
        await (supabase
          .from('spending_insights') as any)
          .delete()
          .eq('user_id', userId)
          .eq('period', period)
          .eq('is_dismissed', false)

        const toInsert = insights.slice(0, 5)
        const { error: insertError } = await (supabase
          .from('spending_insights') as any)
          .insert(toInsert)

        if (insertError) {
          console.error(`Error inserting insights for user ${userId}:`, insertError)
        } else {
          totalInserts += toInsert.length
        }
      }
    }

    return NextResponse.json({
      message: `Generated insights for ${userIds.length} users`,
      totalInsights: totalInserts,
    })
  } catch (error) {
    console.error('Error generating insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
