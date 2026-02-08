import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const logs: string[] = []
  const log = (msg: string) => {
    console.log(`[CRON:alerts] ${msg}`)
    logs.push(msg)
  }

  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      log('Unauthorized - invalid CRON_SECRET')
      return NextResponse.json({ error: 'Unauthorized', logs }, { status: 401 })
    }

    log('Authorized successfully')

    const supabase = createAdminSupabaseClient()

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const startOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`
    const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]

    // Get all users who have budgets set for this month
    const { data: budgetsRaw, error: budgetError } = await supabase
      .from('monthly_budgets')
      .select('user_id, salary')
      .eq('month', currentMonth)
      .eq('year', currentYear) as { data: any[] | null; error: any }

    if (budgetError) {
      log(`Error fetching budgets: ${JSON.stringify(budgetError)}`)
      return NextResponse.json({ error: 'Failed to fetch budgets', logs }, { status: 500 })
    }

    const budgets = (budgetsRaw || []) as any[]
    log(`Found ${budgets.length} users with budgets this month`)

    let totalGenerated = 0
    let totalSkipped = 0

    for (const budget of budgets) {
      const userId = budget.user_id
      log(`Processing user: ${userId.substring(0, 8)}...`)

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

      // Fetch user's settings for threshold
      const { data: settings } = await supabase
        .from('user_settings')
        .select('monthly_budget_alert_threshold')
        .eq('user_id', userId)
        .single() as { data: any | null; error: any }

      const budgetThreshold = settings?.monthly_budget_alert_threshold ?? 80

      // Fetch current month's payments for this user
      const { data: paymentsRaw } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth) as { data: any[] | null; error: any }

      const payments = (paymentsRaw || []) as any[]
      const totalSpent = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0)

      // --- Check 1: Budget threshold ---
      if (budget.salary > 0) {
        const spentPercentage = (totalSpent / budget.salary) * 100

        if (spentPercentage >= 100) {
          alertsToInsert.push({
            user_id: userId,
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
            user_id: userId,
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
      const threeMonthsAgo = new Date(currentYear, currentMonth - 4, 1)
      const lastMonthEnd = new Date(currentYear, currentMonth - 1, 0)
      const threeMonthStart = threeMonthsAgo.toISOString().split('T')[0]
      const threeMonthEnd = lastMonthEnd.toISOString().split('T')[0]

      const { data: historicalRaw } = await supabase
        .from('payments')
        .select('amount, category, date')
        .eq('user_id', userId)
        .gte('date', threeMonthStart)
        .lte('date', threeMonthEnd) as { data: any[] | null; error: any }

      const historicalPayments = (historicalRaw || []) as any[]

      if (historicalPayments.length > 0 && payments.length > 0) {
        const historicalByCategory: Record<string, number> = {}
        for (const p of historicalPayments) {
          const cat = p.category || 'Uncategorized'
          historicalByCategory[cat] = (historicalByCategory[cat] || 0) + Number(p.amount)
        }

        const monthsWithData = new Set<string>()
        for (const p of historicalPayments) {
          const date = new Date(p.date)
          monthsWithData.add(`${date.getFullYear()}-${date.getMonth()}`)
        }
        const numMonths = Math.max(monthsWithData.size, 1)

        const currentByCategory: Record<string, number> = {}
        for (const p of payments) {
          const cat = p.category || 'Uncategorized'
          currentByCategory[cat] = (currentByCategory[cat] || 0) + Number(p.amount)
        }

        for (const [category, currentAmount] of Object.entries(currentByCategory)) {
          const avgAmount = (historicalByCategory[category] || 0) / numMonths
          if (avgAmount > 0 && currentAmount > avgAmount * 1.5) {
            alertsToInsert.push({
              user_id: userId,
              alert_type: 'category_spike',
              title: `Unusual Spending: ${category}`,
              message: `"${category}" spending of ${formatCurrency(currentAmount)} is ${((currentAmount / avgAmount) * 100).toFixed(0)}% of ${numMonths}-month average (${formatCurrency(avgAmount)}/month).`,
              severity: 'warning',
              is_read: false,
              related_category: category,
              related_amount: currentAmount,
            })
          }
        }
      }

      // --- Check 3: Large payments (> 3x average) in the last 7 days ---
      if (payments.length > 1) {
        const allAmounts = payments.map((p: any) => Number(p.amount))
        const avgPayment = allAmounts.reduce((a: number, b: number) => a + b, 0) / allAmounts.length

        for (const p of payments) {
          const amount = Number(p.amount)
          if (amount > avgPayment * 3 && amount > 100) {
            const paymentDate = new Date(p.date)
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

            if (paymentDate >= sevenDaysAgo) {
              alertsToInsert.push({
                user_id: userId,
                alert_type: 'large_payment',
                title: 'Large Payment Detected',
                message: `Payment of ${formatCurrency(amount)} for "${p.description}" is ${(amount / avgPayment).toFixed(1)}x your average payment.`,
                severity: amount > avgPayment * 5 ? 'critical' : 'info',
                is_read: false,
                related_category: p.category || null,
                related_amount: amount,
              })
            }
          }
        }
      }

      // --- Calculate safe-to-spend ---
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
      const daysRemaining = daysInMonth - now.getDate() + 1
      const remaining = budget.salary - totalSpent
      const safeToSpend = remaining / Math.max(daysRemaining, 1)

      if (safeToSpend < 0) {
        alertsToInsert.push({
          user_id: userId,
          alert_type: 'negative_safe_to_spend',
          title: 'Negative Safe-to-Spend',
          message: `You are over budget. Consider cutting back on spending for the remaining ${daysRemaining} days of the month.`,
          severity: 'critical',
          is_read: false,
          related_category: null,
          related_amount: safeToSpend,
        })
      }

      // --- Deduplicate against existing unread alerts ---
      const { data: existingRaw } = await supabase
        .from('spending_alerts')
        .select('alert_type, related_category')
        .eq('user_id', userId)
        .eq('is_read', false) as { data: any[] | null; error: any }

      const existingAlerts = (existingRaw || []) as any[]
      const existingSet = new Set(
        existingAlerts.map((a: any) => `${a.alert_type}::${a.related_category || ''}`)
      )

      const newAlerts = alertsToInsert.filter(
        (a) => !existingSet.has(`${a.alert_type}::${a.related_category || ''}`)
      )

      if (newAlerts.length > 0) {
        const { error: insertError } = await (supabase
          .from('spending_alerts') as any)
          .insert(newAlerts)

        if (insertError) {
          log(`  Error inserting alerts for user: ${JSON.stringify(insertError)}`)
        } else {
          log(`  Generated ${newAlerts.length} alerts, skipped ${alertsToInsert.length - newAlerts.length} duplicates`)
          totalGenerated += newAlerts.length
        }
      } else {
        log(`  No new alerts needed`)
      }
      totalSkipped += alertsToInsert.length - newAlerts.length
    }

    log(`Done: ${totalGenerated} alerts generated, ${totalSkipped} skipped`)
    return NextResponse.json({
      message: `Generated ${totalGenerated} alerts`,
      generated: totalGenerated,
      skipped: totalSkipped,
      logs,
    })
  } catch (error) {
    log(`Unexpected error: ${error}`)
    return NextResponse.json({ error: 'Failed to generate alerts', logs }, { status: 500 })
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

// Allow POST for manual testing
export { GET as POST }
