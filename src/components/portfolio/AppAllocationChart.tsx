'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { useSettings } from '@/lib/settings-context'

interface AppAllocationChartProps {
  data: Array<{ name: string; value: number }>
}

const COLORS = [
  '#6366F1', // indigo
  '#22C55E', // green
  '#F97316', // orange
  '#EC4899', // pink
  '#14B8A6', // teal
  '#8B5CF6', // purple
  '#EF4444', // red
  '#F59E0B', // amber
  '#3B82F6', // blue
  '#64748B', // slate
]

interface CustomLabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
}

function renderCustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: CustomLabelProps) {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function AppAllocationChart({ data }: AppAllocationChartProps) {
  const { formatCurrency } = useSettings()

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          By Platform / App
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No platform data available.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        By Platform / App
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel as any}
            outerRadius={120}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0]
                return (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {formatCurrency(item.value as number)}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend
            formatter={(value: string) => (
              <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
