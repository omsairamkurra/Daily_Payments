import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch investments
    const { data: investments } = await supabase
      .from('investments')
      .select('invested_amount, current_value')
      .eq('user_id', user.id)

    // Fetch savings goals
    const { data: goals } = await supabase
      .from('savings_goals')
      .select('saved_amount')
      .eq('user_id', user.id)

    // Fetch manual assets
    const { data: manualAssets } = await supabase
      .from('manual_assets')
      .select('estimated_value, category')
      .eq('user_id', user.id)

    // Fetch loans (liabilities)
    const { data: loans } = await supabase
      .from('loans')
      .select('loan_amount, emi_amount, paid_emis, tenure_months')
      .eq('user_id', user.id)

    // Calculate investment total (prefer current_value, fallback to invested_amount)
    const investmentTotal = (investments || []).reduce((sum, inv) => {
      return sum + (inv.current_value ?? inv.invested_amount ?? 0)
    }, 0)

    // Calculate savings total
    const savingsTotal = (goals || []).reduce((sum, goal) => {
      return sum + (goal.saved_amount ?? 0)
    }, 0)

    // Calculate manual assets by category
    const assetsByCategory: Record<string, number> = {}
    let manualAssetsTotal = 0
    for (const asset of manualAssets || []) {
      const val = asset.estimated_value ?? 0
      manualAssetsTotal += val
      const cat = asset.category || 'other'
      assetsByCategory[cat] = (assetsByCategory[cat] || 0) + val
    }

    // Calculate remaining loan amounts (liability)
    const loansTotal = (loans || []).reduce((sum, loan) => {
      const paidEmis = loan.paid_emis || 0
      const totalEmis = loan.tenure_months || 0
      const remainingEmis = Math.max(0, totalEmis - paidEmis)
      const remaining = remainingEmis * (loan.emi_amount || 0)
      return sum + remaining
    }, 0)

    const totalAssets = investmentTotal + savingsTotal + manualAssetsTotal
    const totalLiabilities = loansTotal
    const netWorth = totalAssets - totalLiabilities

    // Build breakdown for pie chart
    const breakdown: Record<string, number> = {}
    if (investmentTotal > 0) breakdown['Investments'] = investmentTotal
    if (savingsTotal > 0) breakdown['Savings'] = savingsTotal
    for (const [cat, val] of Object.entries(assetsByCategory)) {
      if (val > 0) {
        const label = CATEGORY_LABELS[cat] || cat
        breakdown[label] = val
      }
    }

    // Fetch historical snapshots
    const { data: snapshots } = await supabase
      .from('net_worth_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .order('snapshot_date', { ascending: true })

    const history = (snapshots || []).map((s) => ({
      id: s.id,
      date: s.snapshot_date,
      totalAssets: s.total_assets,
      totalLiabilities: s.total_liabilities,
      netWorth: s.net_worth,
      breakdown: s.breakdown,
    }))

    return NextResponse.json({
      current: {
        totalAssets,
        totalLiabilities,
        netWorth,
        breakdown,
        investmentTotal,
        savingsTotal,
        manualAssetsTotal,
        loansTotal,
      },
      history,
    })
  } catch (error) {
    console.error('Error fetching net worth:', error)
    return NextResponse.json(
      { error: 'Failed to fetch net worth' },
      { status: 500 }
    )
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  real_estate: 'Real Estate',
  vehicle: 'Vehicles',
  jewelry: 'Jewelry',
  crypto: 'Crypto',
  cash: 'Cash',
  other: 'Other Assets',
}

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Recalculate current net worth
    const { data: investments } = await supabase
      .from('investments')
      .select('invested_amount, current_value')
      .eq('user_id', user.id)

    const { data: goals } = await supabase
      .from('savings_goals')
      .select('saved_amount')
      .eq('user_id', user.id)

    const { data: manualAssets } = await supabase
      .from('manual_assets')
      .select('estimated_value, category')
      .eq('user_id', user.id)

    const { data: loans } = await supabase
      .from('loans')
      .select('loan_amount, emi_amount, paid_emis, tenure_months')
      .eq('user_id', user.id)

    const investmentTotal = (investments || []).reduce((sum, inv) => {
      return sum + (inv.current_value ?? inv.invested_amount ?? 0)
    }, 0)

    const savingsTotal = (goals || []).reduce((sum, goal) => {
      return sum + (goal.saved_amount ?? 0)
    }, 0)

    const assetsByCategory: Record<string, number> = {}
    let manualAssetsTotal = 0
    for (const asset of manualAssets || []) {
      const val = asset.estimated_value ?? 0
      manualAssetsTotal += val
      const cat = asset.category || 'other'
      assetsByCategory[cat] = (assetsByCategory[cat] || 0) + val
    }

    const loansTotal = (loans || []).reduce((sum, loan) => {
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

    const today = new Date().toISOString().split('T')[0]

    // Upsert snapshot for today (avoid duplicates)
    const { data: existing } = await supabase
      .from('net_worth_snapshots')
      .select('id')
      .eq('user_id', user.id)
      .eq('snapshot_date', today)
      .single()

    let snapshot
    if (existing) {
      const { data, error } = await supabase
        .from('net_worth_snapshots')
        .update({
          total_assets: totalAssets,
          total_liabilities: totalLiabilities,
          net_worth: netWorth,
          breakdown,
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating snapshot:', error)
        return NextResponse.json(
          { error: 'Failed to update snapshot' },
          { status: 500 }
        )
      }
      snapshot = data
    } else {
      const { data, error } = await supabase
        .from('net_worth_snapshots')
        .insert({
          user_id: user.id,
          snapshot_date: today,
          total_assets: totalAssets,
          total_liabilities: totalLiabilities,
          net_worth: netWorth,
          breakdown,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating snapshot:', error)
        return NextResponse.json(
          { error: 'Failed to create snapshot' },
          { status: 500 }
        )
      }
      snapshot = data
    }

    return NextResponse.json({
      message: 'Snapshot saved successfully',
      snapshot: {
        id: snapshot.id,
        date: snapshot.snapshot_date,
        totalAssets: snapshot.total_assets,
        totalLiabilities: snapshot.total_liabilities,
        netWorth: snapshot.net_worth,
        breakdown: snapshot.breakdown,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error taking snapshot:', error)
    return NextResponse.json(
      { error: 'Failed to take snapshot' },
      { status: 500 }
    )
  }
}
