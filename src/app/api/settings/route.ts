import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

interface DbSettings {
  user_id: string
  currency: string
  locale: string
  theme: string
  monthly_budget_alert_threshold: number
  spending_alert_enabled: boolean
  weekly_summary_enabled: boolean
  display_name: string
}

function mapToFrontend(settings: DbSettings) {
  return {
    currency: settings.currency,
    locale: settings.locale,
    theme: settings.theme,
    monthlyBudgetAlertThreshold: settings.monthly_budget_alert_threshold,
    spendingAlertEnabled: settings.spending_alert_enabled,
    weeklySummaryEnabled: settings.weekly_summary_enabled,
    displayName: settings.display_name,
  }
}

function mapToDb(updates: Record<string, unknown>) {
  const mapping: Record<string, string> = {
    currency: 'currency',
    locale: 'locale',
    theme: 'theme',
    monthlyBudgetAlertThreshold: 'monthly_budget_alert_threshold',
    spendingAlertEnabled: 'spending_alert_enabled',
    weeklySummaryEnabled: 'weekly_summary_enabled',
    displayName: 'display_name',
  }

  const dbUpdates: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(updates)) {
    if (mapping[key]) {
      dbUpdates[mapping[key]] = value
    }
  }
  return dbUpdates
}

const defaultSettings = {
  currency: 'INR',
  locale: 'en-IN',
  theme: 'light',
  monthly_budget_alert_threshold: 80,
  spending_alert_enabled: true,
  weekly_summary_enabled: false,
  display_name: '',
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      )
    }

    if (!settings) {
      const { data: newSettings, error: insertError } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          ...defaultSettings,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating default settings:', insertError)
        return NextResponse.json(
          { error: 'Failed to create settings' },
          { status: 500 }
        )
      }

      return NextResponse.json(mapToFrontend(newSettings as DbSettings))
    }

    return NextResponse.json(mapToFrontend(settings as DbSettings))
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
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
    const dbUpdates = mapToDb(body)

    if (Object.keys(dbUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const { data: settings, error } = await supabase
      .from('user_settings')
      .update(dbUpdates)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating settings:', error)
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      )
    }

    if (!settings) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(mapToFrontend(settings as DbSettings))
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
