import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

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

    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text('Payment Report', 14, 22)

    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)

    if (startDate || endDate) {
      const dateRange = `Date Range: ${startDate || 'Start'} to ${endDate || 'End'}`
      doc.text(dateRange, 14, 36)
    }

    const tableData = payments.map((payment) => [
      new Date(payment.date).toLocaleDateString(),
      payment.description,
      `₹${payment.amount.toFixed(2)}`,
      payment.location || 'N/A',
    ])

    const total = payments.reduce((sum, p) => sum + p.amount, 0)
    tableData.push(['', 'TOTAL', `₹${total.toFixed(2)}`, ''])

    autoTable(doc, {
      head: [['Date', 'Description', 'Amount', 'Location']],
      body: tableData,
      startY: startDate || endDate ? 42 : 36,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
      footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold' },
    })

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="payments-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error exporting PDF:', error)
    return NextResponse.json(
      { error: 'Failed to export PDF' },
      { status: 500 }
    )
  }
}
