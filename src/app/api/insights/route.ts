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

    const { data: insights, error } = await supabase
      .from('spending_insights')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Error fetching insights:', error)
      return NextResponse.json(
        { error: 'Failed to fetch insights' },
        { status: 500 }
      )
    }

    // Map snake_case to camelCase for frontend compatibility
    const mappedInsights = insights?.map((insight) => ({
      id: insight.id,
      insightType: insight.insight_type,
      title: insight.title,
      description: insight.description,
      data: insight.data,
      period: insight.period,
      isDismissed: insight.is_dismissed,
      createdAt: insight.created_at,
    }))

    return NextResponse.json(mappedInsights)
  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
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
        { error: 'Insight ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('spending_insights')
      .update({ is_dismissed: true })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error dismissing insight:', error)
      return NextResponse.json(
        { error: 'Failed to dismiss insight' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Insight dismissed successfully' })
  } catch (error) {
    console.error('Error dismissing insight:', error)
    return NextResponse.json(
      { error: 'Failed to dismiss insight' },
      { status: 500 }
    )
  }
}
