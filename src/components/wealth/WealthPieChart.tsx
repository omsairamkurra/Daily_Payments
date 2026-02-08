'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

interface WealthPieChartProps {
  data: Array<{ name: string; value: number }>
}

const COLORS = [
  '#3B82F6', // blue - Mutual Funds
  '#10B981', // green - Stocks
  '#F59E0B', // amber - SIP
  '#8B5CF6', // purple - FD
  '#EF4444', // red - PPF
  '#F97316', // orange - Gold
  '#6366F1', // indigo - Silver
  '#EC4899', // pink - Savings
  '#14B8A6', // teal - Other
  '#64748B', // slate - fallback
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: { name: string; value: number; percentage?: number }
  }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {data.name}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {formatCurrency(data.value)}
        </p>
      </div>
    )
  }
  return null
}

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

export default function WealthPieChart({ data }: WealthPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Asset Allocation
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No asset data available. Add investments or savings goals to see your allocation.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Asset Allocation
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
          <Tooltip content={<CustomTooltip />} />
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
