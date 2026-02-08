import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

// Indian new tax regime slabs 2025-26
function calculateTaxNewRegime(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0

  const slabs = [
    { limit: 400000, rate: 0 },
    { limit: 800000, rate: 0.05 },
    { limit: 1200000, rate: 0.10 },
    { limit: 1600000, rate: 0.15 },
    { limit: 2000000, rate: 0.20 },
    { limit: 2400000, rate: 0.25 },
    { limit: Infinity, rate: 0.30 },
  ]

  let tax = 0
  let remaining = taxableIncome
  let prevLimit = 0

  for (const slab of slabs) {
    const slabAmount = Math.min(remaining, slab.limit - prevLimit)
    if (slabAmount <= 0) break
    tax += slabAmount * slab.rate
    remaining -= slabAmount
    prevLimit = slab.limit
  }

  return Math.round(tax)
}

// Parse FY string "2025-26" into date range
function parseFYDateRange(fy: string): { startDate: string; endDate: string } {
  const parts = fy.split('-')
  const startYear = parseInt(parts[0])
  // FY "2025-26" means April 2025 to March 2026
  const startDate = `${startYear}-04-01`
  const endDate = `${startYear + 1}-03-31`
  return { startDate, endDate }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fy = searchParams.get('fy')

    if (!fy) {
      return NextResponse.json(
        { error: 'Financial year (fy) query parameter is required' },
        { status: 400 }
      )
    }

    const { startDate, endDate } = parseFYDateRange(fy)

    // 1. Fetch manual tax deductions for this FY
    const { data: deductions, error: deductionsError } = await supabase
      .from('tax_deductions')
      .select('*')
      .eq('user_id', user.id)
      .eq('financial_year', fy)

    if (deductionsError) {
      console.error('Error fetching deductions:', deductionsError)
      return NextResponse.json(
        { error: 'Failed to fetch deductions' },
        { status: 500 }
      )
    }

    // 2. Fetch investments that qualify under 80C (PPF, ELSS, NPS) within FY date range
    const { data: taxSavingInvestments, error: investmentsError } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', user.id)
      .in('type', ['ppf', 'elss', 'nps'])
      .gte('purchase_date', startDate)
      .lte('purchase_date', endDate)

    if (investmentsError) {
      console.error('Error fetching tax-saving investments:', investmentsError)
      return NextResponse.json(
        { error: 'Failed to fetch investments' },
        { status: 500 }
      )
    }

    // 3. Fetch all investments for capital gains (those with current_value set, indicating sold/valued)
    const { data: allInvestments, error: allInvError } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', user.id)
      .gte('purchase_date', startDate)
      .lte('purchase_date', endDate)
      .not('current_value', 'is', null)

    if (allInvError) {
      console.error('Error fetching all investments:', allInvError)
      return NextResponse.json(
        { error: 'Failed to fetch investments for capital gains' },
        { status: 500 }
      )
    }

    // 4. Fetch income entries for this FY to compute total income
    const { data: incomeEntries, error: incomeError } = await supabase
      .from('income_entries')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)

    // Build Section 80C items
    const section80CItems: Array<{ description: string; amount: number; section: string }> = []

    // Add manual 80C deductions
    const manual80C = (deductions || []).filter((d) => d.section === '80C')
    for (const d of manual80C) {
      section80CItems.push({
        description: d.description,
        amount: d.amount,
        section: '80C',
      })
    }

    // Add auto-detected 80C investments (PPF, ELSS)
    for (const inv of taxSavingInvestments || []) {
      if (inv.type === 'ppf' || inv.type === 'elss') {
        section80CItems.push({
          description: `${inv.name} (${inv.type.toUpperCase()})`,
          amount: inv.invested_amount,
          section: '80C',
        })
      }
    }

    const section80CTotal = section80CItems.reduce((sum, item) => sum + item.amount, 0)

    // Build Section 80D items
    const section80DItems: Array<{ description: string; amount: number; section: string }> = []
    const manual80D = (deductions || []).filter((d) => d.section === '80D')
    for (const d of manual80D) {
      section80DItems.push({
        description: d.description,
        amount: d.amount,
        section: '80D',
      })
    }
    const section80DTotal = section80DItems.reduce((sum, item) => sum + item.amount, 0)

    // Build NPS deduction (Section 80CCD(1B))
    const npsItems: Array<{ description: string; amount: number; section: string }> = []
    const manualNPS = (deductions || []).filter((d) => d.section === 'NPS')
    for (const d of manualNPS) {
      npsItems.push({
        description: d.description,
        amount: d.amount,
        section: 'NPS',
      })
    }
    for (const inv of taxSavingInvestments || []) {
      if (inv.type === 'nps') {
        npsItems.push({
          description: `${inv.name} (NPS)`,
          amount: inv.invested_amount,
          section: 'NPS',
        })
      }
    }

    // Build other deductions (80E, 80G, HRA, Other)
    const otherSections = ['80E', '80G', 'HRA', 'Other']
    const otherDeductions: Array<{ description: string; amount: number; section: string }> = []
    for (const d of deductions || []) {
      if (otherSections.includes(d.section)) {
        otherDeductions.push({
          description: d.description,
          amount: d.amount,
          section: d.section,
        })
      }
    }

    // Capital gains calculation
    const shortTermGains: Array<{ name: string; invested: number; sold: number; gain: number }> = []
    const longTermGains: Array<{ name: string; invested: number; sold: number; gain: number }> = []

    for (const inv of allInvestments || []) {
      if (inv.current_value === null || inv.current_value === undefined) continue
      const gain = inv.current_value - inv.invested_amount

      // Simple heuristic: if purchase date is within 1 year of FY end, it's short-term
      const purchaseDate = new Date(inv.purchase_date)
      const fyEnd = new Date(endDate)
      const diffMs = fyEnd.getTime() - purchaseDate.getTime()
      const diffYears = diffMs / (365.25 * 24 * 60 * 60 * 1000)

      const gainEntry = {
        name: inv.name,
        invested: inv.invested_amount,
        sold: inv.current_value,
        gain,
      }

      if (diffYears <= 1) {
        shortTermGains.push(gainEntry)
      } else {
        longTermGains.push(gainEntry)
      }
    }

    // Total income from income_entries (if table exists)
    let totalIncome = 0
    if (!incomeError && incomeEntries) {
      totalIncome = incomeEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0)
    }

    // Calculate total deductions
    const totalDeductions =
      Math.min(section80CTotal, 150000) +
      section80DTotal +
      npsItems.reduce((sum, item) => sum + item.amount, 0) +
      otherDeductions.reduce((sum, item) => sum + item.amount, 0)

    // Taxable income
    const capitalGainsTotal =
      shortTermGains.reduce((sum, g) => sum + g.gain, 0) +
      longTermGains.reduce((sum, g) => sum + g.gain, 0)

    const taxableIncome = Math.max(0, totalIncome + capitalGainsTotal - totalDeductions)
    const estimatedTax = calculateTaxNewRegime(taxableIncome)

    const report = {
      financialYear: fy,
      totalIncome,
      section80C: {
        total: section80CTotal,
        limit: 150000,
        items: section80CItems,
      },
      section80D: {
        total: section80DTotal,
        items: section80DItems,
      },
      nps: {
        total: npsItems.reduce((sum, item) => sum + item.amount, 0),
        items: npsItems,
      },
      otherDeductions,
      capitalGains: {
        shortTerm: shortTermGains,
        longTerm: longTermGains,
      },
      totalDeductions,
      taxableIncome,
      estimatedTax,
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error generating tax report:', error)
    return NextResponse.json(
      { error: 'Failed to generate tax report' },
      { status: 500 }
    )
  }
}
