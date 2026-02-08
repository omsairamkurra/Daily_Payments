import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { calculateCAGR } from '@/lib/financial-math'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: investments, error } = await supabase
      .from('investments')
      .select('id, name, type, app, invested_amount, current_value, units, purchase_date, notes, frequency, is_sip')
      .eq('user_id', user.id)
      .order('purchase_date', { ascending: true })

    if (error) {
      console.error('Error fetching investments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch investments' },
        { status: 500 }
      )
    }

    if (!investments || investments.length === 0) {
      return NextResponse.json({
        totalInvested: 0,
        totalCurrentValue: 0,
        overallGainLoss: 0,
        overallGainLossPercent: 0,
        byType: [],
        byApp: [],
        investments: [],
        bestPerformer: null,
        worstPerformer: null,
      })
    }

    // Calculate per-investment metrics
    const now = new Date()
    const mappedInvestments = investments.map((inv) => {
      const invested = inv.invested_amount || 0
      const current = inv.current_value || 0
      const gainLoss = current - invested
      const gainLossPercent = invested > 0 ? (gainLoss / invested) * 100 : 0

      // Calculate CAGR
      let cagr = 0
      if (inv.purchase_date && inv.current_value && invested > 0) {
        const purchaseDate = new Date(inv.purchase_date)
        const yearsDiff = (now.getTime() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        if (yearsDiff > 0) {
          cagr = calculateCAGR(invested, current, yearsDiff)
        }
      }

      return {
        id: inv.id,
        name: inv.name,
        type: inv.type || 'Other',
        app: inv.app || 'Unknown',
        invested,
        current,
        gainLoss,
        gainLossPercent: parseFloat(gainLossPercent.toFixed(2)),
        cagr: parseFloat(cagr.toFixed(2)),
        purchaseDate: inv.purchase_date,
        isSip: inv.is_sip || false,
        frequency: inv.frequency || 'one_time',
      }
    })

    // Overall stats
    const totalInvested = mappedInvestments.reduce((sum, inv) => sum + inv.invested, 0)
    const totalCurrentValue = mappedInvestments.reduce((sum, inv) => sum + inv.current, 0)
    const overallGainLoss = totalCurrentValue - totalInvested
    const overallGainLossPercent = totalInvested > 0
      ? parseFloat(((overallGainLoss / totalInvested) * 100).toFixed(2))
      : 0

    // Breakdown by type
    const typeMap = new Map<string, { invested: number; current: number; count: number }>()
    mappedInvestments.forEach((inv) => {
      const existing = typeMap.get(inv.type) || { invested: 0, current: 0, count: 0 }
      existing.invested += inv.invested
      existing.current += inv.current
      existing.count += 1
      typeMap.set(inv.type, existing)
    })

    const byType = Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      invested: parseFloat(data.invested.toFixed(2)),
      current: parseFloat(data.current.toFixed(2)),
      gainLoss: parseFloat((data.current - data.invested).toFixed(2)),
      percentage: totalInvested > 0
        ? parseFloat(((data.invested / totalInvested) * 100).toFixed(2))
        : 0,
      count: data.count,
    }))

    // Breakdown by app
    const appMap = new Map<string, { invested: number; current: number; count: number }>()
    mappedInvestments.forEach((inv) => {
      const existing = appMap.get(inv.app) || { invested: 0, current: 0, count: 0 }
      existing.invested += inv.invested
      existing.current += inv.current
      existing.count += 1
      appMap.set(inv.app, existing)
    })

    const byApp = Array.from(appMap.entries()).map(([app, data]) => ({
      app,
      invested: parseFloat(data.invested.toFixed(2)),
      current: parseFloat(data.current.toFixed(2)),
      gainLoss: parseFloat((data.current - data.invested).toFixed(2)),
      count: data.count,
    }))

    // Best and worst performers (only investments that have current value)
    const withValue = mappedInvestments.filter((inv) => inv.current > 0)
    let bestPerformer: { name: string; gainLossPercent: number } | null = null
    let worstPerformer: { name: string; gainLossPercent: number } | null = null

    if (withValue.length > 0) {
      const sorted = [...withValue].sort((a, b) => b.gainLossPercent - a.gainLossPercent)
      bestPerformer = {
        name: sorted[0].name,
        gainLossPercent: sorted[0].gainLossPercent,
      }
      worstPerformer = {
        name: sorted[sorted.length - 1].name,
        gainLossPercent: sorted[sorted.length - 1].gainLossPercent,
      }
    }

    return NextResponse.json({
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      totalCurrentValue: parseFloat(totalCurrentValue.toFixed(2)),
      overallGainLoss: parseFloat(overallGainLoss.toFixed(2)),
      overallGainLossPercent,
      byType,
      byApp,
      investments: mappedInvestments,
      bestPerformer,
      worstPerformer,
    })
  } catch (error) {
    console.error('Error analyzing portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to analyze portfolio' },
      { status: 500 }
    )
  }
}
