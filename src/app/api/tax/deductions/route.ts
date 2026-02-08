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
    const financialYear = searchParams.get('financialYear')

    let query = supabase
      .from('tax_deductions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (financialYear) {
      query = query.eq('financial_year', financialYear)
    }

    const { data: deductions, error } = await query

    if (error) {
      console.error('Error fetching tax deductions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tax deductions' },
        { status: 500 }
      )
    }

    // Map snake_case to camelCase for frontend compatibility
    const mappedDeductions = deductions?.map((d) => ({
      id: d.id,
      financialYear: d.financial_year,
      section: d.section,
      description: d.description,
      amount: d.amount,
      proofNote: d.proof_note,
      investmentId: d.investment_id,
      createdAt: d.created_at,
    }))

    return NextResponse.json(mappedDeductions)
  } catch (error) {
    console.error('Error fetching tax deductions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tax deductions' },
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
    const { financialYear, section, description, amount, proofNote, investmentId } = body

    if (!financialYear || !section || !description || amount === undefined) {
      return NextResponse.json(
        { error: 'Financial year, section, description, and amount are required' },
        { status: 400 }
      )
    }

    const { data: deduction, error } = await supabase
      .from('tax_deductions')
      .insert({
        user_id: user.id,
        financial_year: financialYear,
        section,
        description,
        amount: parseFloat(amount),
        proof_note: proofNote || null,
        investment_id: investmentId || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating tax deduction:', error)
      return NextResponse.json(
        { error: 'Failed to create tax deduction' },
        { status: 500 }
      )
    }

    const mappedDeduction = {
      id: deduction.id,
      financialYear: deduction.financial_year,
      section: deduction.section,
      description: deduction.description,
      amount: deduction.amount,
      proofNote: deduction.proof_note,
      investmentId: deduction.investment_id,
      createdAt: deduction.created_at,
    }

    return NextResponse.json(mappedDeduction, { status: 201 })
  } catch (error) {
    console.error('Error creating tax deduction:', error)
    return NextResponse.json(
      { error: 'Failed to create tax deduction' },
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
    const { id, financialYear, section, description, amount, proofNote, investmentId } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Deduction ID is required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (financialYear !== undefined) updateData.financial_year = financialYear
    if (section !== undefined) updateData.section = section
    if (description !== undefined) updateData.description = description
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (proofNote !== undefined) updateData.proof_note = proofNote || null
    if (investmentId !== undefined) updateData.investment_id = investmentId || null

    const { data: deduction, error } = await supabase
      .from('tax_deductions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating tax deduction:', error)
      return NextResponse.json(
        { error: 'Failed to update tax deduction' },
        { status: 500 }
      )
    }

    if (!deduction) {
      return NextResponse.json(
        { error: 'Deduction not found' },
        { status: 404 }
      )
    }

    const mappedDeduction = {
      id: deduction.id,
      financialYear: deduction.financial_year,
      section: deduction.section,
      description: deduction.description,
      amount: deduction.amount,
      proofNote: deduction.proof_note,
      investmentId: deduction.investment_id,
      createdAt: deduction.created_at,
    }

    return NextResponse.json(mappedDeduction)
  } catch (error) {
    console.error('Error updating tax deduction:', error)
    return NextResponse.json(
      { error: 'Failed to update tax deduction' },
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
        { error: 'Deduction ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('tax_deductions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting tax deduction:', error)
      return NextResponse.json(
        { error: 'Failed to delete tax deduction' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Tax deduction deleted successfully' })
  } catch (error) {
    console.error('Error deleting tax deduction:', error)
    return NextResponse.json(
      { error: 'Failed to delete tax deduction' },
      { status: 500 }
    )
  }
}
