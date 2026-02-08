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
      .from('recurring_payments')
      .select('*')
      .eq('user_id', user.id)
      .order('next_due_date', { ascending: true })

    if (startDate) query = query.gte('next_due_date', startDate)
    if (endDate) query = query.lte('next_due_date', endDate)

    const { data: recurring, error } = await query

    if (error) {
      console.error('Error fetching recurring payments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch recurring payments' },
        { status: 500 }
      )
    }

    const mapped = (recurring || []).map((r) => ({
      id: r.id,
      name: r.name,
      amount: r.amount,
      frequency: r.frequency,
      bank: r.bank,
      category: r.category,
      startDate: r.start_date,
      nextDueDate: r.next_due_date,
      isActive: r.is_active,
      notes: r.notes,
      goalId: r.goal_id,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching recurring payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recurring payments' },
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
    const { name, amount, frequency, startDate, nextDueDate, bank, category, notes, isActive, goalId } = body

    if (!name || amount === undefined || !frequency || !startDate || !nextDueDate) {
      return NextResponse.json(
        { error: 'Name, amount, frequency, startDate, and nextDueDate are required' },
        { status: 400 }
      )
    }

    const { data: recurring, error } = await supabase
      .from('recurring_payments')
      .insert({
        name,
        amount: parseFloat(amount),
        frequency,
        bank: bank || null,
        category: category || null,
        start_date: startDate,
        next_due_date: nextDueDate,
        is_active: isActive !== undefined ? isActive : true,
        notes: notes || null,
        goal_id: goalId || null,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating recurring payment:', error)
      return NextResponse.json(
        { error: 'Failed to create recurring payment' },
        { status: 500 }
      )
    }

    return NextResponse.json(recurring, { status: 201 })
  } catch (error) {
    console.error('Error creating recurring payment:', error)
    return NextResponse.json(
      { error: 'Failed to create recurring payment' },
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
    const { id, name, amount, frequency, startDate, nextDueDate, bank, category, notes, isActive, goalId } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Recurring payment ID is required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (name !== undefined) updateData.name = name
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (frequency !== undefined) updateData.frequency = frequency
    if (bank !== undefined) updateData.bank = bank
    if (category !== undefined) updateData.category = category
    if (startDate !== undefined) updateData.start_date = startDate
    if (nextDueDate !== undefined) updateData.next_due_date = nextDueDate
    if (isActive !== undefined) updateData.is_active = isActive
    if (notes !== undefined) updateData.notes = notes
    if (goalId !== undefined) updateData.goal_id = goalId || null

    const { data: recurring, error } = await supabase
      .from('recurring_payments')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating recurring payment:', error)
      return NextResponse.json(
        { error: 'Failed to update recurring payment' },
        { status: 500 }
      )
    }

    if (!recurring) {
      return NextResponse.json(
        { error: 'Recurring payment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(recurring)
  } catch (error) {
    console.error('Error updating recurring payment:', error)
    return NextResponse.json(
      { error: 'Failed to update recurring payment' },
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
        { error: 'Recurring payment ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('recurring_payments')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting recurring payment:', error)
      return NextResponse.json(
        { error: 'Failed to delete recurring payment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Recurring payment deleted successfully' })
  } catch (error) {
    console.error('Error deleting recurring payment:', error)
    return NextResponse.json(
      { error: 'Failed to delete recurring payment' },
      { status: 500 }
    )
  }
}
