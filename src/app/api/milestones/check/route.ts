import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const THRESHOLDS = [25, 50, 75, 100]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { goalId } = body

    if (!goalId) {
      return NextResponse.json(
        { error: 'goalId is required' },
        { status: 400 }
      )
    }

    // Fetch the savings goal
    const { data: goal, error: goalError } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single()

    if (goalError || !goal) {
      console.error('Error fetching goal:', goalError)
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      )
    }

    // Fetch existing milestones for this goal
    const { data: existingMilestones, error: milestonesError } = await supabase
      .from('goal_milestones')
      .select('milestone_type')
      .eq('goal_id', goalId)
      .eq('user_id', user.id)

    if (milestonesError) {
      console.error('Error fetching existing milestones:', milestonesError)
      return NextResponse.json(
        { error: 'Failed to check milestones' },
        { status: 500 }
      )
    }

    const existingTypes = new Set(
      existingMilestones?.map((m) => m.milestone_type) || []
    )

    // Calculate current percentage
    const percentage = goal.target_amount > 0
      ? (goal.saved_amount / goal.target_amount) * 100
      : 0

    // Determine which new milestones to create
    const newMilestones: Array<{
      user_id: string
      goal_id: string
      milestone_type: number
      achieved_at: string
      is_celebrated: boolean
    }> = []

    for (const threshold of THRESHOLDS) {
      if (percentage >= threshold && !existingTypes.has(threshold)) {
        newMilestones.push({
          user_id: user.id,
          goal_id: goalId,
          milestone_type: threshold,
          achieved_at: new Date().toISOString(),
          is_celebrated: false,
        })
      }
    }

    if (newMilestones.length === 0) {
      return NextResponse.json({ newMilestones: [], message: 'No new milestones reached' })
    }

    // Insert new milestones
    const { data: created, error: insertError } = await supabase
      .from('goal_milestones')
      .insert(newMilestones)
      .select()

    if (insertError) {
      console.error('Error creating milestones:', insertError)
      return NextResponse.json(
        { error: 'Failed to create milestones' },
        { status: 500 }
      )
    }

    // Map to camelCase
    const mappedMilestones = created?.map((m) => ({
      id: m.id,
      userId: m.user_id,
      goalId: m.goal_id,
      milestoneType: m.milestone_type,
      achievedAt: m.achieved_at,
      isCelebrated: m.is_celebrated,
      createdAt: m.created_at,
    }))

    return NextResponse.json({ newMilestones: mappedMilestones }, { status: 201 })
  } catch (error) {
    console.error('Error checking milestones:', error)
    return NextResponse.json(
      { error: 'Failed to check milestones' },
      { status: 500 }
    )
  }
}
