'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface MonthComparisonChartProps {
  thisMonth: Record<string, number>
  lastMonth: Record<string, number>
}

function formatCurrency(value: number): string {
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toString()
}

export default function MonthComparisonChart({ thisMonth, lastMonth }: MonthComparisonChartProps) {
  // Merge categories from both months
  const allCategories = new Set([
    ...Object.keys(thisMonth),
    ...Object.keys(lastMonth),
  ])

  const chartData = Array.from(allCategories).map((category) => ({
    category,
    thisMonth: thisMonth[category] || 0,
    lastMonth: lastMonth[category] || 0,
  }))

  // Sort by this month's spending descending
  chartData.sort((a, b) => b.thisMonth - a.thisMonth)

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          This Month vs Last Month
        </h3>
        <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
          No comparison data available
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        This Month vs Last Month
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            dataKey="category"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            axisLine={{ stroke: '#4B5563' }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            axisLine={{ stroke: '#4B5563' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB',
            }}
            formatter={(value, name) => [
              new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(Number(value)),
              name === 'thisMonth' ? 'This Month' : 'Last Month',
            ]}
            labelStyle={{ color: '#9CA3AF' }}
          />
          <Legend
            formatter={(value: string) => (
              <span style={{ color: '#9CA3AF', fontSize: '12px' }}>
                {value === 'thisMonth' ? 'This Month' : 'Last Month'}
              </span>
            )}
          />
          <Bar dataKey="thisMonth" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="lastMonth" fill="#6B7280" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
