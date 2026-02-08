'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface CategoryPieChartProps {
  data: Array<{ name: string; value: number }>
}

const COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#84CC16', // lime
  '#A855F7', // purple
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  const filteredData = data.filter((d) => d.value > 0)

  if (filteredData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Spending by Category
        </h3>
        <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
          No spending data for this month
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Spending by Category
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {filteredData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB',
            }}
            formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
            labelStyle={{ color: '#9CA3AF' }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
