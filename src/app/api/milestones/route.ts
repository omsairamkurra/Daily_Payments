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
    const goalId = searchParams.get('goalId')

    if (!goalId) {
      return NextResponse.json(
        { error: 'goalId query parameter is required' },
        { status: 400 }
      )
    }

    const { data: milestones, error } = await supabase
      .from('goal_milestones')
      .select('*')
      .eq('user_id', user.id)
      .eq('goal_id', goalId)
      .order('milestone_type', { ascending: true })

    if (error) {
      console.error('Error fetching milestones:', error)
      return NextResponse.json(
        { error: 'Failed to fetch milestones' },
        { status: 500 }
      )
    }

    // Map snake_case to camelCase for frontend compatibility
    const mappedMilestones = milestones?.map((m) => ({
      id: m.id,
      userId: m.user_id,
      goalId: m.goal_id,
      milestoneType: m.milestone_type,
      achievedAt: m.achieved_at,
      isCelebrated: m.is_celebrated,
      createdAt: m.created_at,
    }))

    return NextResponse.json(mappedMilestones)
  } catch (error) {
    console.error('Error fetching milestones:', error)
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
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
    const { id, isCelebrated } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Milestone ID is required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (isCelebrated !== undefined) updateData.is_celebrated = isCelebrated

    const { data: milestone, error } = await supabase
      .from('goal_milestones')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating milestone:', error)
      return NextResponse.json(
        { error: 'Failed to update milestone' },
        { status: 500 }
      )
    }

    const mappedMilestone = {
      id: milestone.id,
      userId: milestone.user_id,
      goalId: milestone.goal_id,
      milestoneType: milestone.milestone_type,
      achievedAt: milestone.achieved_at,
      isCelebrated: milestone.is_celebrated,
      createdAt: milestone.created_at,
    }

    return NextResponse.json(mappedMilestone)
  } catch (error) {
    console.error('Error updating milestone:', error)
    return NextResponse.json(
      { error: 'Failed to update milestone' },
      { status: 500 }
    )
  }
}
