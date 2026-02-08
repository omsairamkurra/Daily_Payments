'use client'

interface DateFilterProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onApply: () => void
  onClear: () => void
}

export default function DateFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onClear,
}: DateFilterProps) {
  const setThisMonth = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    onStartDateChange(firstDay.toISOString().split('T')[0])
    onEndDateChange(lastDay.toISOString().split('T')[0])
  }

  const setLastMonth = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
    onStartDateChange(firstDay.toISOString().split('T')[0])
    onEndDateChange(lastDay.toISOString().split('T')[0])
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Filter by Date</h3>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onApply}
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={onClear}
            className="flex-1 sm:flex-none px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Clear
          </button>
        </div>

        <div className="flex gap-2 sm:ml-auto">
          <button
            onClick={setThisMonth}
            className="flex-1 sm:flex-none px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            This Month
          </button>
          <button
            onClick={setLastMonth}
            className="flex-1 sm:flex-none px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Last Month
          </button>
        </div>
      </div>
    </div>
  )
}
