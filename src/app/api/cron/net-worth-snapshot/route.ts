import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const logs: string[] = []
  const log = (msg: string) => {
    console.log(`[CRON:net-worth-snapshot] ${msg}`)
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
    const today = new Date().toISOString().split('T')[0]

    // Get all unique user IDs from various tables
    const { data: investmentUsersRaw } = await supabase
      .from('investments')
      .select('user_id') as { data: any[] | null; error: any }

    const { data: goalUsersRaw } = await supabase
      .from('savings_goals')
      .select('user_id') as { data: any[] | null; error: any }

    const { data: loanUsersRaw } = await supabase
      .from('loans')
      .select('user_id') as { data: any[] | null; error: any }

    const { data: assetUsersRaw } = await supabase
      .from('manual_assets')
      .select('user_id') as { data: any[] | null; error: any }

    const investmentUsers = (investmentUsersRaw || []) as any[]
    const goalUsers = (goalUsersRaw || []) as any[]
    const loanUsers = (loanUsersRaw || []) as any[]
    const assetUsers = (assetUsersRaw || []) as any[]

    // Collect unique user IDs
    const userIdSet = new Set<string>()
    for (const row of investmentUsers) userIdSet.add(row.user_id)
    for (const row of goalUsers) userIdSet.add(row.user_id)
    for (const row of loanUsers) userIdSet.add(row.user_id)
    for (const row of assetUsers) userIdSet.add(row.user_id)

    const userIds = Array.from(userIdSet)
    log(`Found ${userIds.length} unique users`)

    let created = 0
    let updated = 0
    let failed = 0

    for (const userId of userIds) {
      try {
        log(`Processing user: ${userId.substring(0, 8)}...`)

        // Fetch investments for this user
        const { data: investmentsRaw } = await supabase
          .from('investments')
          .select('invested_amount, current_value')
          .eq('user_id', userId) as { data: any[] | null; error: any }

        const { data: goalsRaw } = await supabase
          .from('savings_goals')
          .select('saved_amount')
          .eq('user_id', userId) as { data: any[] | null; error: any }

        const { data: manualAssetsRaw } = await supabase
          .from('manual_assets')
          .select('estimated_value, category')
          .eq('user_id', userId) as { data: any[] | null; error: any }

        const { data: loansRaw } = await supabase
          .from('loans')
          .select('loan_amount, emi_amount, paid_emis, tenure_months')
          .eq('user_id', userId) as { data: any[] | null; error: any }

        const investments = (investmentsRaw || []) as any[]
        const goals = (goalsRaw || []) as any[]
        const manualAssets = (manualAssetsRaw || []) as any[]
        const loans = (loansRaw || []) as any[]

        const investmentTotal = investments.reduce((sum: number, inv: any) => {
          return sum + (inv.current_value ?? inv.invested_amount ?? 0)
        }, 0)

        const savingsTotal = goals.reduce((sum: number, goal: any) => {
          return sum + (goal.saved_amount ?? 0)
        }, 0)

        const assetsByCategory: Record<string, number> = {}
        let manualAssetsTotal = 0
        for (const asset of manualAssets) {
          const val = asset.estimated_value ?? 0
          manualAssetsTotal += val
          const cat = asset.category || 'other'
          assetsByCategory[cat] = (assetsByCategory[cat] || 0) + val
        }

        const loansTotal = loans.reduce((sum: number, loan: any) => {
          const paidEmis = loan.paid_emis || 0
          const totalEmis = loan.tenure_months || 0
          const remainingEmis = Math.max(0, totalEmis - paidEmis)
          const remaining = remainingEmis * (loan.emi_amount || 0)
          return sum + remaining
        }, 0)

        const totalAssets = investmentTotal + savingsTotal + manualAssetsTotal
        const totalLiabilities = loansTotal
        const netWorth = totalAssets - totalLiabilities

        const breakdown: Record<string, number> = {
          investments: investmentTotal,
          savings: savingsTotal,
          manualAssets: manualAssetsTotal,
          loans: loansTotal,
          ...assetsByCategory,
        }

        // Check if snapshot already exists for today
        const { data: existing } = await supabase
          .from('net_worth_snapshots')
          .select('id')
          .eq('user_id', userId)
          .eq('snapshot_date', today)
          .single() as { data: any | null; error: any }

        if (existing) {
          const { error } = await (supabase
            .from('net_worth_snapshots') as any)
            .update({
              total_assets: totalAssets,
              total_liabilities: totalLiabilities,
              net_worth: netWorth,
              breakdown,
            })
            .eq('id', existing.id)

          if (error) {
            log(`  ERROR updating snapshot: ${JSON.stringify(error)}`)
            failed++
          } else {
            log(`  Updated snapshot: net worth = ${netWorth}`)
            updated++
          }
        } else {
          const { error } = await (supabase
            .from('net_worth_snapshots') as any)
            .insert({
              user_id: userId,
              snapshot_date: today,
              total_assets: totalAssets,
              total_liabilities: totalLiabilities,
              net_worth: netWorth,
              breakdown,
            })

          if (error) {
            log(`  ERROR creating snapshot: ${JSON.stringify(error)}`)
            failed++
          } else {
            log(`  Created snapshot: net worth = ${netWorth}`)
            created++
          }
        }
      } catch (err) {
        log(`  ERROR processing user ${userId.substring(0, 8)}...: ${err}`)
        failed++
      }
    }

    log(`Done: ${created} created, ${updated} updated, ${failed} failed`)
    return NextResponse.json({
      message: `Processed ${userIds.length} users`,
      created,
      updated,
      failed,
      logs,
    })
  } catch (error) {
    log(`Unexpected error: ${error}`)
    return NextResponse.json(
      { error: 'Failed to create net worth snapshots', logs },
      { status: 500 }
    )
  }
}

// Allow POST as well for manual testing
export { GET as POST }
