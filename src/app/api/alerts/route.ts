import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: alerts, error } = await supabase
      .from('spending_alerts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching alerts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch alerts' },
        { status: 500 }
      )
    }

    const mapped = (alerts || []).map((a) => ({
      id: a.id,
      userId: a.user_id,
      alertType: a.alert_type,
      title: a.title,
      message: a.message,
      severity: a.severity,
      isRead: a.is_read,
      relatedCategory: a.related_category,
      relatedAmount: a.related_amount,
      createdAt: a.created_at,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
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
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    // Support marking all as read
    if (id === 'all') {
      const { error } = await supabase
        .from('spending_alerts')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) {
        console.error('Error marking all alerts as read:', error)
        return NextResponse.json(
          { error: 'Failed to mark alerts as read' },
          { status: 500 }
        )
      }

      return NextResponse.json({ message: 'All alerts marked as read' })
    }

    const { data: alert, error } = await supabase
      .from('spending_alerts')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error marking alert as read:', error)
      return NextResponse.json(
        { error: 'Failed to mark alert as read' },
        { status: 500 }
      )
    }

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Alert marked as read' })
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}
