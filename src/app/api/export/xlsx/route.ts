import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: {
      userId: string
      date?: { gte?: Date; lte?: Date }
    } = {
      userId: session.user.id,
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        where.date.gte = new Date(startDate)
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.date.lte = end
      }
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { date: 'desc' },
    })

    const data = payments.map((payment) => ({
      Date: new Date(payment.date).toLocaleDateString(),
      Description: payment.description,
      Amount: `₹${payment.amount.toFixed(2)}`,
      Location: payment.location || 'N/A',
    }))

    const total = payments.reduce((sum, p) => sum + p.amount, 0)
    data.push({
      Date: '',
      Description: 'TOTAL',
      Amount: `₹${total.toFixed(2)}`,
      Location: '',
    })

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments')

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="payments-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Error exporting XLSX:', error)
    return NextResponse.json(
      { error: 'Failed to export XLSX' },
      { status: 500 }
    )
  }
}
