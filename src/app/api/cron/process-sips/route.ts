import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminSupabaseClient()
    const today = new Date().toISOString().split('T')[0]

    // Find active SIPs due today or overdue
    const { data: sipInvestmentsRaw, error } = await supabase
      .from('investments')
      .select('*, savings_goals(id, saved_amount)')
      .eq('is_sip', true)
      .lte('next_sip_date', today)
      .not('next_sip_date', 'is', null) as { data: any[] | null; error: any }

    if (error) {
      console.error('Error fetching SIPs:', error)
      return NextResponse.json({ error: 'Failed to fetch SIPs' }, { status: 500 })
    }

    const sipInvestments = (sipInvestmentsRaw || []) as any[]
    let processed = 0

    for (const sip of sipInvestments) {
      const sipAmount = sip.sip_amount || 0
      if (sipAmount <= 0) continue

      // Update invested amount
      const newInvestedAmount = (sip.invested_amount || 0) + sipAmount

      // Calculate next SIP date based on frequency
      const currentDate = new Date(sip.next_sip_date)
      let nextDate: Date

      switch (sip.frequency) {
        case 'daily':
          nextDate = new Date(currentDate)
          nextDate.setDate(nextDate.getDate() + 1)
          break
        case 'weekly':
          nextDate = new Date(currentDate)
          nextDate.setDate(nextDate.getDate() + 7)
          break
        case 'monthly':
        default:
          nextDate = new Date(currentDate)
          nextDate.setMonth(nextDate.getMonth() + 1)
          break
      }

      // Update investment
      await (supabase
        .from('investments') as any)
        .update({
          invested_amount: newInvestedAmount,
          next_sip_date: nextDate.toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('id', sip.id)

      // Update linked goal if exists
      if (sip.goal_id) {
        const currentSaved = sip.savings_goals?.saved_amount || 0
        await (supabase
          .from('savings_goals') as any)
          .update({
            saved_amount: currentSaved + sipAmount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sip.goal_id)
      }

      processed++
    }

    return NextResponse.json({ message: `Processed ${processed} SIPs` })
  } catch (error) {
    console.error('SIP processing error:', error)
    return NextResponse.json({ error: 'Failed to process SIPs' }, { status: 500 })
  }
}

// Allow POST as well for manual testing
export { GET as POST }
