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
      .from('income_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate + 'T23:59:59')

    const { data: entries, error } = await query

    if (error) {
      console.error('Error fetching income entries:', error)
      return NextResponse.json(
        { error: 'Failed to fetch income entries' },
        { status: 500 }
      )
    }

    // Map snake_case to camelCase
    const mapped = (entries || []).map((entry) => ({
      id: entry.id,
      date: entry.date,
      source: entry.source,
      description: entry.description,
      amount: entry.amount,
      isRecurring: entry.is_recurring,
      frequency: entry.frequency,
      category: entry.category,
      notes: entry.notes,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching income entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch income entries' },
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
    const { date, source, description, amount, isRecurring, frequency, category, notes } = body

    if (!date || !source || !description || !amount) {
      return NextResponse.json(
        { error: 'Date, source, description, and amount are required' },
        { status: 400 }
      )
    }

    const { data: entry, error } = await supabase
      .from('income_entries')
      .insert({
        user_id: user.id,
        date,
        source,
        description,
        amount: parseFloat(amount),
        is_recurring: isRecurring || false,
        frequency: isRecurring ? frequency : null,
        category: category || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating income entry:', error)
      return NextResponse.json(
        { error: 'Failed to create income entry' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: entry.id,
      date: entry.date,
      source: entry.source,
      description: entry.description,
      amount: entry.amount,
      isRecurring: entry.is_recurring,
      frequency: entry.frequency,
      category: entry.category,
      notes: entry.notes,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating income entry:', error)
    return NextResponse.json(
      { error: 'Failed to create income entry' },
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
    const { id, date, source, description, amount, isRecurring, frequency, category, notes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Income entry ID is required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (date !== undefined) updateData.date = date
    if (source !== undefined) updateData.source = source
    if (description !== undefined) updateData.description = description
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (isRecurring !== undefined) updateData.is_recurring = isRecurring
    if (frequency !== undefined) updateData.frequency = isRecurring ? frequency : null
    if (category !== undefined) updateData.category = category || null
    if (notes !== undefined) updateData.notes = notes || null

    const { data: entry, error } = await supabase
      .from('income_entries')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating income entry:', error)
      return NextResponse.json(
        { error: 'Failed to update income entry' },
        { status: 500 }
      )
    }

    if (!entry) {
      return NextResponse.json(
        { error: 'Income entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: entry.id,
      date: entry.date,
      source: entry.source,
      description: entry.description,
      amount: entry.amount,
      isRecurring: entry.is_recurring,
      frequency: entry.frequency,
      category: entry.category,
      notes: entry.notes,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
    })
  } catch (error) {
    console.error('Error updating income entry:', error)
    return NextResponse.json(
      { error: 'Failed to update income entry' },
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
        { error: 'Income entry ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('income_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting income entry:', error)
      return NextResponse.json(
        { error: 'Failed to delete income entry' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Income entry deleted successfully' })
  } catch (error) {
    console.error('Error deleting income entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete income entry' },
      { status: 500 }
    )
  }
}
