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

    // Fetch all payments for pattern detection
    const { data: payments, error } = await supabase
      .from('payments')
      .select('description, amount, date')
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }

    if (!payments || payments.length < 3) {
      return NextResponse.json([])
    }

    // Group by (description, amount)
    const groups: Record<string, { dates: string[]; amount: number; description: string }> = {}

    for (const p of payments) {
      const key = `${p.description.toLowerCase().trim()}|${p.amount}`
      if (!groups[key]) {
        groups[key] = { dates: [], amount: p.amount, description: p.description }
      }
      groups[key].dates.push(p.date)
    }

    // Find patterns with 3+ occurrences at regular intervals
    const suggestions = []

    for (const group of Object.values(groups)) {
      if (group.dates.length < 3) continue

      const sortedDates = group.dates.sort()
      const intervals: number[] = []

      for (let i = 1; i < sortedDates.length; i++) {
        const diff = Math.abs(
          new Date(sortedDates[i]).getTime() - new Date(sortedDates[i - 1]).getTime()
        )
        intervals.push(Math.round(diff / (1000 * 60 * 60 * 24)))
      }

      // Check if intervals are roughly consistent (within 5 days variance)
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
      const isConsistent = intervals.every(
        (interval) => Math.abs(interval - avgInterval) <= 5
      )

      if (isConsistent && avgInterval >= 5 && avgInterval <= 35) {
        suggestions.push({
          description: group.description,
          amount: group.amount,
          occurrences: group.dates.length,
          intervalDays: Math.round(avgInterval),
        })
      }
    }

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('SIP detection error:', error)
    return NextResponse.json({ error: 'Failed to detect SIP patterns' }, { status: 500 })
  }
}
