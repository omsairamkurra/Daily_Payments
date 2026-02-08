import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { goalId, amount } = body

    if (!goalId || amount === undefined) {
      return NextResponse.json(
        { error: 'Goal ID and amount are required' },
        { status: 400 }
      )
    }

    // Get current goal
    const { data: goal, error: fetchError } = await supabase
      .from('savings_goals')
      .select('saved_amount')
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Increment saved amount
    const newSavedAmount = (goal.saved_amount || 0) + parseFloat(amount)

    const { error: updateError } = await supabase
      .from('savings_goals')
      .update({
        saved_amount: newSavedAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .eq('user_id', user.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
    }

    return NextResponse.json({ savedAmount: newSavedAmount })
  } catch (error) {
    console.error('Update goal saved amount error:', error)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
}
