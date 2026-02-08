import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const startOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`
    const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]

    const alertsToInsert: Array<{
      user_id: string
      alert_type: string
      title: string
      message: string
      severity: string
      is_read: boolean
      related_category: string | null
      related_amount: number | null
    }> = []

    // --- Fetch current month's budget ---
    const { data: budget } = await supabase
      .from('monthly_budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .eq('year', currentYear)
      .single()

    // --- Fetch current month's payments ---
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)

    const totalSpent = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0)

    // --- Fetch user settings for alert threshold ---
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const budgetThreshold = settings?.monthly_budget_alert_threshold ?? 80

    // --- Check 1: Budget threshold alert ---
    if (budget && budget.salary > 0) {
      const spentPercentage = (totalSpent / budget.salary) * 100

      if (spentPercentage >= 100) {
        alertsToInsert.push({
          user_id: user.id,
          alert_type: 'budget_exceeded',
          title: 'Budget Exceeded!',
          message: `You have spent ${formatCurrency(totalSpent)} which is ${spentPercentage.toFixed(0)}% of your ${formatCurrency(budget.salary)} budget this month.`,
          severity: 'critical',
          is_read: false,
          related_category: null,
          related_amount: totalSpent,
        })
      } else if (spentPercentage >= budgetThreshold) {
        alertsToInsert.push({
          user_id: user.id,
          alert_type: 'budget_warning',
          title: 'Approaching Budget Limit',
          message: `You have used ${spentPercentage.toFixed(0)}% of your monthly budget (${formatCurrency(totalSpent)} of ${formatCurrency(budget.salary)}).`,
          severity: 'warning',
          is_read: false,
          related_category: null,
          related_amount: totalSpent,
        })
      }
    }

    // --- Check 2: Category spending vs 3-month average ---
    // Get payments from the last 3 months (excluding current month)
    const threeMonthsAgo = new Date(currentYear, currentMonth - 4, 1)
    const lastMonthEnd = new Date(currentYear, currentMonth - 1, 0)
    const threeMonthStart = threeMonthsAgo.toISOString().split('T')[0]
    const threeMonthEnd = lastMonthEnd.toISOString().split('T')[0]

    const { data: historicalPayments } = await supabase
      .from('payments')
      .select('amount, category, date')
      .eq('user_id', user.id)
      .gte('date', threeMonthStart)
      .lte('date', threeMonthEnd)

    if (historicalPayments && historicalPayments.length > 0 && payments && payments.length > 0) {
      // Calculate 3-month average per category
      const historicalByCategory: Record<string, number> = {}
      for (const p of historicalPayments) {
        const cat = p.category || 'Uncategorized'
        historicalByCategory[cat] = (historicalByCategory[cat] || 0) + Number(p.amount)
      }

      // Count months with data for proper averaging
      const monthsWithData = new Set<string>()
      for (const p of historicalPayments) {
        const date = new Date(p.date)
        monthsWithData.add(`${date.getFullYear()}-${date.getMonth()}`)
      }
      const numMonths = Math.max(monthsWithData.size, 1)

      // Current month spending per category
      const currentByCategory: Record<string, number> = {}
      for (const p of payments) {
        const cat = p.category || 'Uncategorized'
        currentByCategory[cat] = (currentByCategory[cat] || 0) + Number(p.amount)
      }

      // Compare each category
      for (const [category, currentAmount] of Object.entries(currentByCategory)) {
        const avgAmount = (historicalByCategory[category] || 0) / numMonths
        if (avgAmount > 0 && currentAmount > avgAmount * 1.5) {
          alertsToInsert.push({
            user_id: user.id,
            alert_type: 'category_spike',
            title: `Unusual Spending: ${category}`,
            message: `Your "${category}" spending of ${formatCurrency(currentAmount)} this month is ${((currentAmount / avgAmount) * 100).toFixed(0)}% of your ${numMonths}-month average (${formatCurrency(avgAmount)}/month).`,
            severity: 'warning',
            is_read: false,
            related_category: category,
            related_amount: currentAmount,
          })
        }
      }
    }

    // --- Check 3: Single large payment (> 3x average payment) ---
    if (payments && payments.length > 1) {
      const allAmounts = payments.map((p) => Number(p.amount))
      const avgPayment = allAmounts.reduce((a, b) => a + b, 0) / allAmounts.length

      for (const p of payments) {
        const amount = Number(p.amount)
        if (amount > avgPayment * 3 && amount > 100) {
          // Also check it was recent (within last 7 days) to avoid re-alerting old ones
          const paymentDate = new Date(p.date)
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

          if (paymentDate >= sevenDaysAgo) {
            alertsToInsert.push({
              user_id: user.id,
              alert_type: 'large_payment',
              title: 'Large Payment Detected',
              message: `Payment of ${formatCurrency(amount)} for "${p.description}" is ${(amount / avgPayment).toFixed(1)}x your average payment of ${formatCurrency(avgPayment)}.`,
              severity: amount > avgPayment * 5 ? 'critical' : 'info',
              is_read: false,
              related_category: p.category || null,
              related_amount: amount,
            })
          }
        }
      }
    }

    // --- Deduplicate: Don't insert alerts that already exist (unread, same type + category) ---
    const { data: existingAlerts } = await supabase
      .from('spending_alerts')
      .select('alert_type, related_category')
      .eq('user_id', user.id)
      .eq('is_read', false)

    const existingSet = new Set(
      (existingAlerts || []).map((a) => `${a.alert_type}::${a.related_category || ''}`)
    )

    const newAlerts = alertsToInsert.filter(
      (a) => !existingSet.has(`${a.alert_type}::${a.related_category || ''}`)
    )

    // --- Insert new alerts ---
    if (newAlerts.length > 0) {
      const { error: insertError } = await supabase
        .from('spending_alerts')
        .insert(newAlerts)

      if (insertError) {
        console.error('Error inserting alerts:', insertError)
        return NextResponse.json(
          { error: 'Failed to generate alerts' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      generated: newAlerts.length,
      skippedDuplicates: alertsToInsert.length - newAlerts.length,
    })
  } catch (error) {
    console.error('Error generating alerts:', error)
    return NextResponse.json(
      { error: 'Failed to generate alerts' },
      { status: 500 }
    )
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
