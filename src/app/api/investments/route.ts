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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query = supabase
      .from('investments')
      .select('*')
      .eq('user_id', user.id)
      .order('purchase_date', { ascending: false })

    if (startDate) query = query.gte('purchase_date', startDate)
    if (endDate) query = query.lte('purchase_date', endDate)

    const { data: investments, error } = await query

    if (error) {
      console.error('Error fetching investments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch investments' },
        { status: 500 }
      )
    }

    // Map snake_case to camelCase for frontend compatibility
    const mappedInvestments = investments?.map((inv) => ({
      id: inv.id,
      name: inv.name,
      type: inv.type,
      app: inv.app,
      investedAmount: inv.invested_amount,
      currentValue: inv.current_value,
      units: inv.units,
      purchaseDate: inv.purchase_date,
      notes: inv.notes,
      frequency: inv.frequency || 'one_time',
      isSip: inv.is_sip || false,
      sipAmount: inv.sip_amount,
      nextSipDate: inv.next_sip_date,
      goalId: inv.goal_id,
      createdAt: inv.created_at,
      updatedAt: inv.updated_at,
    }))

    return NextResponse.json(mappedInvestments)
  } catch (error) {
    console.error('Error fetching investments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch investments' },
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
    const { name, type, app, investedAmount, currentValue, units, purchaseDate, notes, frequency, isSip, sipAmount, nextSipDate, goalId } = body

    if (!name || !type || investedAmount === undefined || !purchaseDate) {
      return NextResponse.json(
        { error: 'Name, type, invested amount, and purchase date are required' },
        { status: 400 }
      )
    }

    const { data: investment, error } = await supabase
      .from('investments')
      .insert({
        name,
        type,
        app: app || null,
        invested_amount: parseFloat(investedAmount),
        current_value: currentValue ? parseFloat(currentValue) : null,
        units: units ? parseFloat(units) : null,
        purchase_date: purchaseDate,
        notes: notes || null,
        frequency: frequency || 'one_time',
        is_sip: isSip || false,
        sip_amount: sipAmount ? parseFloat(sipAmount) : null,
        next_sip_date: nextSipDate || null,
        goal_id: goalId || null,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating investment:', error)
      return NextResponse.json(
        { error: 'Failed to create investment' },
        { status: 500 }
      )
    }

    // Map to camelCase
    const mappedInvestment = {
      id: investment.id,
      name: investment.name,
      type: investment.type,
      app: investment.app,
      investedAmount: investment.invested_amount,
      currentValue: investment.current_value,
      units: investment.units,
      purchaseDate: investment.purchase_date,
      notes: investment.notes,
      frequency: investment.frequency || 'one_time',
      isSip: investment.is_sip || false,
      sipAmount: investment.sip_amount,
      nextSipDate: investment.next_sip_date,
      goalId: investment.goal_id,
      createdAt: investment.created_at,
      updatedAt: investment.updated_at,
    }

    return NextResponse.json(mappedInvestment, { status: 201 })
  } catch (error) {
    console.error('Error creating investment:', error)
    return NextResponse.json(
      { error: 'Failed to create investment' },
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
    const { id, name, type, app, investedAmount, currentValue, units, purchaseDate, notes, frequency, isSip, sipAmount, nextSipDate, goalId } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Investment ID is required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (name !== undefined) updateData.name = name
    if (type !== undefined) updateData.type = type
    if (investedAmount !== undefined) updateData.invested_amount = parseFloat(investedAmount)
    if (currentValue !== undefined) updateData.current_value = currentValue ? parseFloat(currentValue) : null
    if (units !== undefined) updateData.units = units ? parseFloat(units) : null
    if (purchaseDate !== undefined) updateData.purchase_date = purchaseDate
    if (notes !== undefined) updateData.notes = notes || null
    if (app !== undefined) updateData.app = app || null
    if (frequency !== undefined) updateData.frequency = frequency
    if (isSip !== undefined) updateData.is_sip = isSip
    if (sipAmount !== undefined) updateData.sip_amount = sipAmount ? parseFloat(sipAmount) : null
    if (nextSipDate !== undefined) updateData.next_sip_date = nextSipDate || null
    if (goalId !== undefined) updateData.goal_id = goalId || null

    const { data: investment, error } = await supabase
      .from('investments')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating investment:', error)
      return NextResponse.json(
        { error: 'Failed to update investment' },
        { status: 500 }
      )
    }

    if (!investment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      )
    }

    // Map to camelCase
    const mappedInvestment = {
      id: investment.id,
      name: investment.name,
      type: investment.type,
      app: investment.app,
      investedAmount: investment.invested_amount,
      currentValue: investment.current_value,
      units: investment.units,
      purchaseDate: investment.purchase_date,
      notes: investment.notes,
      frequency: investment.frequency || 'one_time',
      isSip: investment.is_sip || false,
      sipAmount: investment.sip_amount,
      nextSipDate: investment.next_sip_date,
      goalId: investment.goal_id,
      createdAt: investment.created_at,
      updatedAt: investment.updated_at,
    }

    return NextResponse.json(mappedInvestment)
  } catch (error) {
    console.error('Error updating investment:', error)
    return NextResponse.json(
      { error: 'Failed to update investment' },
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
        { error: 'Investment ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting investment:', error)
      return NextResponse.json(
        { error: 'Failed to delete investment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Investment deleted successfully' })
  } catch (error) {
    console.error('Error deleting investment:', error)
    return NextResponse.json(
      { error: 'Failed to delete investment' },
      { status: 500 }
    )
  }
}
