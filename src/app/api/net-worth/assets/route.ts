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

    const { data: assets, error } = await supabase
      .from('manual_assets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching manual assets:', error)
      return NextResponse.json(
        { error: 'Failed to fetch manual assets' },
        { status: 500 }
      )
    }

    // Map snake_case to camelCase
    const mappedAssets = (assets || []).map((asset) => ({
      id: asset.id,
      name: asset.name,
      category: asset.category,
      estimatedValue: asset.estimated_value,
      purchaseDate: asset.purchase_date,
      notes: asset.notes,
      createdAt: asset.created_at,
    }))

    return NextResponse.json(mappedAssets)
  } catch (error) {
    console.error('Error fetching manual assets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch manual assets' },
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
    const { name, category, estimatedValue, purchaseDate, notes } = body

    if (!name || estimatedValue === undefined || !category) {
      return NextResponse.json(
        { error: 'Name, category, and estimated value are required' },
        { status: 400 }
      )
    }

    const { data: asset, error } = await supabase
      .from('manual_assets')
      .insert({
        name,
        category,
        estimated_value: parseFloat(estimatedValue),
        purchase_date: purchaseDate || null,
        notes: notes || null,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating manual asset:', error)
      return NextResponse.json(
        { error: 'Failed to create manual asset' },
        { status: 500 }
      )
    }

    const mappedAsset = {
      id: asset.id,
      name: asset.name,
      category: asset.category,
      estimatedValue: asset.estimated_value,
      purchaseDate: asset.purchase_date,
      notes: asset.notes,
      createdAt: asset.created_at,
    }

    return NextResponse.json(mappedAsset, { status: 201 })
  } catch (error) {
    console.error('Error creating manual asset:', error)
    return NextResponse.json(
      { error: 'Failed to create manual asset' },
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
    const { id, name, category, estimatedValue, purchaseDate, notes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (category !== undefined) updateData.category = category
    if (estimatedValue !== undefined) updateData.estimated_value = parseFloat(estimatedValue)
    if (purchaseDate !== undefined) updateData.purchase_date = purchaseDate || null
    if (notes !== undefined) updateData.notes = notes || null

    const { data: asset, error } = await supabase
      .from('manual_assets')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating manual asset:', error)
      return NextResponse.json(
        { error: 'Failed to update manual asset' },
        { status: 500 }
      )
    }

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    const mappedAsset = {
      id: asset.id,
      name: asset.name,
      category: asset.category,
      estimatedValue: asset.estimated_value,
      purchaseDate: asset.purchase_date,
      notes: asset.notes,
      createdAt: asset.created_at,
    }

    return NextResponse.json(mappedAsset)
  } catch (error) {
    console.error('Error updating manual asset:', error)
    return NextResponse.json(
      { error: 'Failed to update manual asset' },
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
        { error: 'Asset ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('manual_assets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting manual asset:', error)
      return NextResponse.json(
        { error: 'Failed to delete manual asset' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Asset deleted successfully' })
  } catch (error) {
    console.error('Error deleting manual asset:', error)
    return NextResponse.json(
      { error: 'Failed to delete manual asset' },
      { status: 500 }
    )
  }
}
