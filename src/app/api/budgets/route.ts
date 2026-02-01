import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') || '')
    const year = parseInt(searchParams.get('year') || '')

    if (isNaN(month) || isNaN(year)) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      )
    }

    // Get budget for the month
    const { data: budget, error: budgetError } = await supabase
      .from('monthly_budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', month)
      .eq('year', year)
      .single()

    if (budgetError && budgetError.code !== 'PGRST116') {
      console.error('Error fetching budget:', budgetError)
      return NextResponse.json(
        { error: 'Failed to fetch budget' },
        { status: 500 }
      )
    }

    // Calculate total spent for the month
    const startOfMonth = `${year}-${month.toString().padStart(2, '0')}-01`
    const endOfMonth = new Date(year, month, 0).toISOString().split('T')[0]

    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
      return NextResponse.json(
        { error: 'Failed to fetch payments' },
        { status: 500 }
      )
    }

    const totalSpent = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

    return NextResponse.json({
      budget: budget || null,
      totalSpent,
      remaining: budget ? Number(budget.salary) - totalSpent : null,
    })
  } catch (error) {
    console.error('Error fetching budget:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budget' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { month, year, salary } = body

    if (!month || !year || salary === undefined) {
      return NextResponse.json(
        { error: 'Month, year, and salary are required' },
        { status: 400 }
      )
    }

    // Try to update existing budget first
    const { data: existingBudget } = await supabase
      .from('monthly_budgets')
      .select('id')
      .eq('user_id', user.id)
      .eq('month', parseInt(month))
      .eq('year', parseInt(year))
      .single()

    let budget
    let error

    if (existingBudget) {
      const result = await supabase
        .from('monthly_budgets')
        .update({
          salary: parseFloat(salary),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingBudget.id)
        .select()
        .single()

      budget = result.data
      error = result.error
    } else {
      const result = await supabase
        .from('monthly_budgets')
        .insert({
          month: parseInt(month),
          year: parseInt(year),
          salary: parseFloat(salary),
          user_id: user.id,
        })
        .select()
        .single()

      budget = result.data
      error = result.error
    }

    if (error) {
      console.error('Error saving budget:', error)
      return NextResponse.json(
        { error: 'Failed to save budget' },
        { status: 500 }
      )
    }

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error('Error creating/updating budget:', error)
    return NextResponse.json(
      { error: 'Failed to save budget' },
      { status: 500 }
    )
  }
}
