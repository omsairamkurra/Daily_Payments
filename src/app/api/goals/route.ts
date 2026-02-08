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
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (startDate) query = query.gte('created_at', startDate)
    if (endDate) query = query.lte('created_at', endDate + 'T23:59:59')

    const { data: goals, error } = await query

    if (error) {
      console.error('Error fetching goals:', error)
      return NextResponse.json(
        { error: 'Failed to fetch goals' },
        { status: 500 }
      )
    }

    // Map snake_case to camelCase for frontend compatibility
    const mappedGoals = goals?.map((goal) => ({
      id: goal.id,
      name: goal.name,
      targetAmount: goal.target_amount,
      savedAmount: goal.saved_amount,
      deadline: goal.deadline,
      notes: goal.notes,
      createdAt: goal.created_at,
      updatedAt: goal.updated_at,
    }))

    return NextResponse.json(mappedGoals)
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
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
    const { name, targetAmount, savedAmount, deadline, notes } = body

    if (!name || targetAmount === undefined) {
      return NextResponse.json(
        { error: 'Name and target amount are required' },
        { status: 400 }
      )
    }

    const { data: goal, error } = await supabase
      .from('savings_goals')
      .insert({
        name,
        target_amount: parseFloat(targetAmount),
        saved_amount: savedAmount ? parseFloat(savedAmount) : 0,
        deadline: deadline || null,
        notes: notes || null,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating goal:', error)
      return NextResponse.json(
        { error: 'Failed to create goal' },
        { status: 500 }
      )
    }

    // Map to camelCase
    const mappedGoal = {
      id: goal.id,
      name: goal.name,
      targetAmount: goal.target_amount,
      savedAmount: goal.saved_amount,
      deadline: goal.deadline,
      notes: goal.notes,
      createdAt: goal.created_at,
      updatedAt: goal.updated_at,
    }

    return NextResponse.json(mappedGoal, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json(
      { error: 'Failed to create goal' },
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
    const { id, name, targetAmount, savedAmount, deadline, notes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (name !== undefined) updateData.name = name
    if (targetAmount !== undefined) updateData.target_amount = parseFloat(targetAmount)
    if (savedAmount !== undefined) updateData.saved_amount = parseFloat(savedAmount)
    if (deadline !== undefined) updateData.deadline = deadline || null
    if (notes !== undefined) updateData.notes = notes || null

    const { data: goal, error } = await supabase
      .from('savings_goals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating goal:', error)
      return NextResponse.json(
        { error: 'Failed to update goal' },
        { status: 500 }
      )
    }

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      )
    }

    // Map to camelCase
    const mappedGoal = {
      id: goal.id,
      name: goal.name,
      targetAmount: goal.target_amount,
      savedAmount: goal.saved_amount,
      deadline: goal.deadline,
      notes: goal.notes,
      createdAt: goal.created_at,
      updatedAt: goal.updated_at,
    }

    return NextResponse.json(mappedGoal)
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json(
      { error: 'Failed to update goal' },
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
        { error: 'Goal ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting goal:', error)
      return NextResponse.json(
        { error: 'Failed to delete goal' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Goal deleted successfully' })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    )
  }
}
