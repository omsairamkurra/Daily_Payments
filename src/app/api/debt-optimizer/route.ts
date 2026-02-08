export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: loans, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching active loans:', error)
      return NextResponse.json(
        { error: 'Failed to fetch loans' },
        { status: 500 }
      )
    }

    // Map snake_case to camelCase for frontend compatibility
    const mappedLoans = loans?.map((loan) => ({
      id: loan.id,
      name: loan.name,
      lender: loan.lender,
      principalAmount: loan.principal_amount,
      interestRate: loan.interest_rate,
      tenureMonths: loan.tenure_months,
      emiAmount: loan.emi_amount,
      startDate: loan.start_date,
      remainingAmount: loan.remaining_amount,
      isActive: loan.is_active,
    })) ?? []

    return NextResponse.json(mappedLoans)
  } catch (error) {
    console.error('Error fetching active loans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loans' },
      { status: 500 }
    )
  }
}
