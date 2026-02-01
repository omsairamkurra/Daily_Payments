import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const investments = await prisma.investment.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: { purchaseDate: 'desc' },
    })

    return NextResponse.json(investments)
  } catch (error) {
    console.error('Error fetching investments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch investments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, investedAmount, currentValue, units, purchaseDate, notes } = body

    if (!name || !type || investedAmount === undefined || !purchaseDate) {
      return NextResponse.json(
        { error: 'Name, type, invested amount, and purchase date are required' },
        { status: 400 }
      )
    }

    const investment = await prisma.investment.create({
      data: {
        name,
        type,
        investedAmount: parseFloat(investedAmount),
        currentValue: currentValue ? parseFloat(currentValue) : null,
        units: units ? parseFloat(units) : null,
        purchaseDate: new Date(purchaseDate),
        notes: notes || null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(investment, { status: 201 })
  } catch (error) {
    console.error('Error creating investment:', error)
    return NextResponse.json(
      { error: 'Failed to create investment' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, type, investedAmount, currentValue, units, purchaseDate, notes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Investment ID is required' },
        { status: 400 }
      )
    }

    const existingInvestment = await prisma.investment.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existingInvestment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      )
    }

    const investment = await prisma.investment.update({
      where: { id },
      data: {
        name,
        type,
        investedAmount: investedAmount !== undefined ? parseFloat(investedAmount) : undefined,
        currentValue: currentValue !== undefined ? (currentValue ? parseFloat(currentValue) : null) : undefined,
        units: units !== undefined ? (units ? parseFloat(units) : null) : undefined,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        notes: notes !== undefined ? (notes || null) : undefined,
      },
    })

    return NextResponse.json(investment)
  } catch (error) {
    console.error('Error updating investment:', error)
    return NextResponse.json(
      { error: 'Failed to update investment' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Investment ID is required' },
        { status: 400 }
      )
    }

    const existingInvestment = await prisma.investment.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existingInvestment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      )
    }

    await prisma.investment.delete({ where: { id } })

    return NextResponse.json({ message: 'Investment deleted successfully' })
  } catch (error) {
    console.error('Error deleting investment:', error)
    return NextResponse.json(
      { error: 'Failed to delete investment' },
      { status: 500 }
    )
  }
}
