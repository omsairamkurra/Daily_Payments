export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
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
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching loans:', error)
      return NextResponse.json(
        { error: 'Failed to fetch loans' },
        { status: 500 }
      )
    }

    // Map snake_case to camelCase for frontend compatibility
    const mappedLoans = loans?.map((loan) => ({
      id: loan.id,
      name: loan.name,
      bank: loan.bank,
      loanAmount: loan.loan_amount,
      emiAmount: loan.emi_amount,
      interestRate: loan.interest_rate,
      tenureMonths: loan.tenure_months,
      startDate: loan.start_date,
      paidEmis: loan.paid_emis,
      notes: loan.notes,
      createdAt: loan.created_at,
      updatedAt: loan.updated_at,
    }))

    return NextResponse.json(mappedLoans)
  } catch (error) {
    console.error('Error fetching loans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loans' },
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
    const { name, bank, loanAmount, emiAmount, interestRate, tenureMonths, startDate, paidEmis, notes } = body

    if (!name || loanAmount === undefined || emiAmount === undefined || interestRate === undefined || tenureMonths === undefined || !startDate) {
      return NextResponse.json(
        { error: 'Name, loan amount, EMI amount, interest rate, tenure months, and start date are required' },
        { status: 400 }
      )
    }

    const { data: loan, error } = await supabase
      .from('loans')
      .insert({
        name,
        bank: bank || null,
        loan_amount: parseFloat(loanAmount),
        emi_amount: parseFloat(emiAmount),
        interest_rate: parseFloat(interestRate),
        tenure_months: parseInt(tenureMonths),
        start_date: startDate,
        paid_emis: paidEmis ? parseInt(paidEmis) : 0,
        notes: notes || null,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating loan:', error)
      return NextResponse.json(
        { error: 'Failed to create loan' },
        { status: 500 }
      )
    }

    // Map to camelCase
    const mappedLoan = {
      id: loan.id,
      name: loan.name,
      bank: loan.bank,
      loanAmount: loan.loan_amount,
      emiAmount: loan.emi_amount,
      interestRate: loan.interest_rate,
      tenureMonths: loan.tenure_months,
      startDate: loan.start_date,
      paidEmis: loan.paid_emis,
      notes: loan.notes,
      createdAt: loan.created_at,
      updatedAt: loan.updated_at,
    }

    return NextResponse.json(mappedLoan, { status: 201 })
  } catch (error) {
    console.error('Error creating loan:', error)
    return NextResponse.json(
      { error: 'Failed to create loan' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, bank, loanAmount, emiAmount, interestRate, tenureMonths, startDate, paidEmis, notes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Loan ID is required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (name !== undefined) updateData.name = name
    if (bank !== undefined) updateData.bank = bank || null
    if (loanAmount !== undefined) updateData.loan_amount = parseFloat(loanAmount)
    if (emiAmount !== undefined) updateData.emi_amount = parseFloat(emiAmount)
    if (interestRate !== undefined) updateData.interest_rate = parseFloat(interestRate)
    if (tenureMonths !== undefined) updateData.tenure_months = parseInt(tenureMonths)
    if (startDate !== undefined) updateData.start_date = startDate
    if (paidEmis !== undefined) updateData.paid_emis = parseInt(paidEmis)
    if (notes !== undefined) updateData.notes = notes || null

    const { data: loan, error } = await supabase
      .from('loans')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating loan:', error)
      return NextResponse.json(
        { error: 'Failed to update loan' },
        { status: 500 }
      )
    }

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      )
    }

    // Map to camelCase
    const mappedLoan = {
      id: loan.id,
      name: loan.name,
      bank: loan.bank,
      loanAmount: loan.loan_amount,
      emiAmount: loan.emi_amount,
      interestRate: loan.interest_rate,
      tenureMonths: loan.tenure_months,
      startDate: loan.start_date,
      paidEmis: loan.paid_emis,
      notes: loan.notes,
      createdAt: loan.created_at,
      updatedAt: loan.updated_at,
    }

    return NextResponse.json(mappedLoan)
  } catch (error) {
    console.error('Error updating loan:', error)
    return NextResponse.json(
      { error: 'Failed to update loan' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Loan ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting loan:', error)
      return NextResponse.json(
        { error: 'Failed to delete loan' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Loan deleted successfully' })
  } catch (error) {
    console.error('Error deleting loan:', error)
    return NextResponse.json(
      { error: 'Failed to delete loan' },
      { status: 500 }
    )
  }
}
