import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query = supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data: payments, error } = await query

    if (error) {
      console.error('Error fetching payments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch payments' },
        { status: 500 }
      )
    }

    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text('Payment Report', 14, 22)

    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)

    if (startDate || endDate) {
      const dateRange = `Date Range: ${startDate || 'Start'} to ${endDate || 'End'}`
      doc.text(dateRange, 14, 36)
    }

    const tableData = (payments || []).map((payment) => [
      new Date(payment.date).toLocaleDateString(),
      payment.description,
      `₹${Number(payment.amount).toFixed(2)}`,
      payment.location || 'N/A',
    ])

    const total = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0)
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
