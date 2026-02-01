import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') || '')
    const year = parseInt(searchParams.get('year') || '')

    if (isNaN(month) || isNaN(year)) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      )
    }

    const budget = await prisma.monthlyBudget.findUnique({
      where: {
        userId_month_year: {
          userId: session.user.id,
          month,
          year,
        },
      },
    })

    // Calculate total spent for the month
    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)

    const payments = await prisma.payment.aggregate({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    })

    const totalSpent = payments._sum.amount || 0

    return NextResponse.json({
      budget,
      totalSpent,
      remaining: budget ? budget.salary - totalSpent : null,
    })
  } catch (error) {
    console.error('Error fetching budget:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budget' },
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
    const { month, year, salary } = body

    if (!month || !year || salary === undefined) {
      return NextResponse.json(
        { error: 'Month, year, and salary are required' },
        { status: 400 }
      )
    }

    const budget = await prisma.monthlyBudget.upsert({
      where: {
        userId_month_year: {
          userId: session.user.id,
          month: parseInt(month),
          year: parseInt(year),
        },
      },
      update: {
        salary: parseFloat(salary),
      },
      create: {
        month: parseInt(month),
        year: parseInt(year),
        salary: parseFloat(salary),
        userId: session.user.id,
      },
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error('Error creating/updating budget:', error)
    return NextResponse.json(
      { error: 'Failed to save budget' },
      { status: 500 }
    )
  }
}
