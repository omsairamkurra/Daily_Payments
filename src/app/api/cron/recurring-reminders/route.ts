import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { sendEmail } from '@/lib/email'
import { recurringDueReminderTemplate } from '@/lib/email-templates'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const logs: string[] = []
  const log = (msg: string) => {
    console.log(`[CRON:reminders] ${msg}`)
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

    // Get date 2 days from now
    const twoDaysFromNow = new Date()
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)
    const twoDaysStr = twoDaysFromNow.toISOString().split('T')[0]
    const today = new Date().toISOString().split('T')[0]

    log(`Date range: ${today} to ${twoDaysStr}`)

    // First, get ALL recurring payments to see what exists
    const { data: allRecurringRaw, error: allError } = await supabase
      .from('recurring_payments')
      .select('id, name, amount, next_due_date, is_active, user_id, last_reminder_sent') as { data: any[] | null; error: any }

    if (allError) {
      log(`Error fetching all recurring payments: ${JSON.stringify(allError)}`)
    } else {
      const allRecurring = (allRecurringRaw || []) as any[]
      log(`Total recurring payments in DB: ${allRecurring.length}`)
      allRecurring.forEach((p: any) => {
        log(`  - "${p.name}" | amount: ${p.amount} | next_due: ${p.next_due_date} | active: ${p.is_active} | user: ${p.user_id?.substring(0, 8)}...`)
      })
    }

    // Find active recurring payments due within 2 days
    const { data: recurringRaw, error } = await supabase
      .from('recurring_payments')
      .select('*')
      .eq('is_active', true)
      .lte('next_due_date', twoDaysStr)
      .gte('next_due_date', today) as { data: any[] | null; error: any }

    if (error) {
      log(`Query error: ${JSON.stringify(error)}`)
      return NextResponse.json({ error: 'Failed to fetch recurring payments', logs }, { status: 500 })
    }

    const recurringPayments = (recurringRaw || []) as any[]
    log(`Matching payments (active + due within 2 days): ${recurringPayments.length}`)

    if (recurringPayments.length === 0) {
      log('No payments matched. Check: is_active=true AND next_due_date between today and 2 days from now')
      return NextResponse.json({ message: 'Sent 0 reminders', logs })
    }

    let sent = 0
    let skipped = 0

    for (const payment of recurringPayments) {
      log(`Processing: "${payment.name}" (id: ${payment.id})`)

      // Check if reminder was already sent recently (within 24 hours)
      if (payment.last_reminder_sent) {
        const lastSent = new Date(payment.last_reminder_sent)
        const hoursSince = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60)
        if (hoursSince < 24) {
          log(`  SKIPPED - reminder already sent ${hoursSince.toFixed(1)}h ago`)
          skipped++
          continue
        }
      }

      // Look up user email
      log(`  Looking up user: ${payment.user_id}`)
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(payment.user_id)

      if (userError) {
        log(`  ERROR looking up user: ${JSON.stringify(userError)}`)
        continue
      }

      if (!userData?.user?.email) {
        log(`  SKIPPED - no email found for user`)
        skipped++
        continue
      }

      log(`  Sending email to: ${userData.user.email}`)

      // Send reminder email
      const html = recurringDueReminderTemplate(
        payment.name,
        payment.amount,
        payment.next_due_date
      )

      const result = await sendEmail({
        to: userData.user.email,
        subject: `Payment Reminder: ${payment.name} due soon`,
        html,
      })

      if (result.success) {
        log(`  SUCCESS - email sent`)
        await (supabase
          .from('recurring_payments') as any)
          .update({ last_reminder_sent: new Date().toISOString() })
          .eq('id', payment.id)
        sent++
      } else {
        log(`  FAILED - ${JSON.stringify(result.error)}`)
      }
    }

    log(`Done: ${sent} sent, ${skipped} skipped`)
    return NextResponse.json({ message: `Sent ${sent} reminders`, sent, skipped, logs })
  } catch (error) {
    log(`Unexpected error: ${error}`)
    return NextResponse.json({ error: 'Failed to send reminders', logs }, { status: 500 })
  }
}

// Allow POST as well for manual testing
export { GET as POST }
