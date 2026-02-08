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

    // Fetch existing subscriptions to avoid duplicates
    const { data: existingSubscriptions } = await supabase
      .from('subscriptions')
      .select('name, amount')
      .eq('user_id', user.id)

    const existingKeys = new Set(
      (existingSubscriptions || []).map(
        (s) => `${s.name.toLowerCase().trim()}|${s.amount}`
      )
    )

    const suggestions: {
      name: string
      amount: number
      frequency: string
      source: string
      category: string | null
      provider: string | null
    }[] = []

    // 1. Scan recurring_payments for subscription-like entries
    const { data: recurringPayments } = await supabase
      .from('recurring_payments')
      .select('name, amount, frequency, category, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)

    const subscriptionKeywords = [
      'netflix', 'spotify', 'youtube', 'amazon prime', 'prime video',
      'disney', 'hotstar', 'jioCinema', 'swiggy', 'zomato',
      'icloud', 'google one', 'chatgpt', 'openai', 'apple',
      'microsoft', 'adobe', 'dropbox', 'notion', 'slack',
      'subscription', 'premium', 'plus', 'pro', 'membership',
    ]

    if (recurringPayments) {
      for (const rp of recurringPayments) {
        const key = `${rp.name.toLowerCase().trim()}|${rp.amount}`
        if (existingKeys.has(key)) continue

        const nameLower = rp.name.toLowerCase()
        const isSubscriptionLike = subscriptionKeywords.some((kw) =>
          nameLower.includes(kw)
        )

        if (isSubscriptionLike) {
          suggestions.push({
            name: rp.name,
            amount: rp.amount,
            frequency: rp.frequency || 'Monthly',
            source: 'recurring_payments',
            category: rp.category || null,
            provider: rp.name,
          })
          existingKeys.add(key)
        }
      }
    }

    // 2. Scan payments for repeated merchants with similar amounts
    const { data: payments } = await supabase
      .from('payments')
      .select('description, amount, date')
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    if (payments && payments.length >= 2) {
      // Group by (description, amount)
      const groups: Record<string, { dates: string[]; amount: number; description: string }> = {}

      for (const p of payments) {
        if (!p.description) continue
        const key = `${p.description.toLowerCase().trim()}|${p.amount}`
        if (!groups[key]) {
          groups[key] = { dates: [], amount: p.amount, description: p.description }
        }
        groups[key].dates.push(p.date)
      }

      for (const group of Object.values(groups)) {
        if (group.dates.length < 2) continue

        const existKey = `${group.description.toLowerCase().trim()}|${group.amount}`
        if (existingKeys.has(existKey)) continue

        const sortedDates = group.dates.sort()
        const intervals: number[] = []

        for (let i = 1; i < sortedDates.length; i++) {
          const diff = Math.abs(
            new Date(sortedDates[i]).getTime() - new Date(sortedDates[i - 1]).getTime()
          )
          intervals.push(Math.round(diff / (1000 * 60 * 60 * 24)))
        }

        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
        // Check for monthly-ish patterns (28-31 days), quarterly (~90 days), or yearly (~365 days)
        const isMonthly = avgInterval >= 26 && avgInterval <= 35
        const isQuarterly = avgInterval >= 85 && avgInterval <= 100
        const isYearly = avgInterval >= 350 && avgInterval <= 380

        const isConsistent = intervals.every(
          (interval) => Math.abs(interval - avgInterval) <= 7
        )

        if (isConsistent && (isMonthly || isQuarterly || isYearly)) {
          let frequency = 'Monthly'
          if (isQuarterly) frequency = 'Quarterly'
          if (isYearly) frequency = 'Yearly'

          // Try to detect category from name
          const nameLower = group.description.toLowerCase()
          let category: string | null = null
          if (['netflix', 'prime', 'disney', 'hotstar', 'jioCinema'].some(k => nameLower.includes(k))) {
            category = 'Entertainment'
          } else if (['spotify', 'music'].some(k => nameLower.includes(k))) {
            category = 'Music'
          } else if (['icloud', 'google one', 'dropbox'].some(k => nameLower.includes(k))) {
            category = 'Cloud Storage'
          } else if (['swiggy', 'zomato'].some(k => nameLower.includes(k))) {
            category = 'Food Delivery'
          } else if (['chatgpt', 'notion', 'slack', 'adobe'].some(k => nameLower.includes(k))) {
            category = 'Productivity'
          }

          suggestions.push({
            name: group.description,
            amount: group.amount,
            frequency,
            source: 'payments',
            category,
            provider: group.description,
          })
          existingKeys.add(existKey)
        }
      }
    }

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('Subscription detection error:', error)
    return NextResponse.json(
      { error: 'Failed to detect subscriptions' },
      { status: 500 }
    )
  }
}
