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
    const activeOnly = searchParams.get('activeOnly')

    let query = supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('next_renewal_date', { ascending: true })

    if (activeOnly === 'true') {
      query = query.eq('is_active', true)
    }

    const { data: subscriptions, error } = await query

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    const mapped = (subscriptions || []).map((s) => ({
      id: s.id,
      name: s.name,
      amount: s.amount,
      frequency: s.frequency,
      category: s.category,
      provider: s.provider,
      startDate: s.start_date,
      nextRenewalDate: s.next_renewal_date,
      isActive: s.is_active,
      lastUsedDate: s.last_used_date,
      autoDetected: s.auto_detected,
      createdAt: s.created_at,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
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
    const { name, amount, frequency, category, provider, startDate, nextRenewalDate, isActive, lastUsedDate, autoDetected } = body

    if (!name || amount === undefined || !frequency || !startDate || !nextRenewalDate) {
      return NextResponse.json(
        { error: 'Name, amount, frequency, startDate, and nextRenewalDate are required' },
        { status: 400 }
      )
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        name,
        amount: parseFloat(amount),
        frequency,
        category: category || null,
        provider: provider || null,
        start_date: startDate,
        next_renewal_date: nextRenewalDate,
        is_active: isActive !== undefined ? isActive : true,
        last_used_date: lastUsedDate || null,
        auto_detected: autoDetected || false,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating subscription:', error)
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
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
    const { id, name, amount, frequency, category, provider, startDate, nextRenewalDate, isActive, lastUsedDate, autoDetected } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (frequency !== undefined) updateData.frequency = frequency
    if (category !== undefined) updateData.category = category || null
    if (provider !== undefined) updateData.provider = provider || null
    if (startDate !== undefined) updateData.start_date = startDate
    if (nextRenewalDate !== undefined) updateData.next_renewal_date = nextRenewalDate
    if (isActive !== undefined) updateData.is_active = isActive
    if (lastUsedDate !== undefined) updateData.last_used_date = lastUsedDate || null
    if (autoDetected !== undefined) updateData.auto_detected = autoDetected

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating subscription:', error)
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
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
        { error: 'Subscription ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting subscription:', error)
      return NextResponse.json(
        { error: 'Failed to delete subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Subscription deleted successfully' })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    )
  }
}
