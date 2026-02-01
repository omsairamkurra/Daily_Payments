'use client'

interface ExportButtonsProps {
  startDate: string
  endDate: string
}

export default function ExportButtons({ startDate, endDate }: ExportButtonsProps) {
  const getQueryString = () => {
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    return params.toString() ? `?${params.toString()}` : ''
  }

  const exportXLSX = () => {
    window.location.href = `/api/export/xlsx${getQueryString()}`
  }

  const exportPDF = () => {
    window.location.href = `/api/export/pdf${getQueryString()}`
  }

  return (
    <div className="flex gap-2 md:gap-3">
      <button
        onClick={exportXLSX}
        className="px-2 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 md:gap-2 text-sm md:text-base"
      >
        <span className="hidden sm:inline">Export</span>
        <span>XLSX</span>
      </button>
      <button
        onClick={exportPDF}
        className="px-2 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1 md:gap-2 text-sm md:text-base"
      >
        <span className="hidden sm:inline">Export</span>
        <span>PDF</span>
      </button>
    </div>
  )
}
