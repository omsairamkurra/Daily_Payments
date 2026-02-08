'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface BreakdownPieProps {
  data: Array<{ name: string; value: number }>
}

const COLORS = [
  '#3b82f6', // blue - Investments
  '#22c55e', // green - Savings
  '#f59e0b', // amber - Real Estate
  '#8b5cf6', // purple - Vehicles
  '#ec4899', // pink - Jewelry
  '#f97316', // orange - Crypto
  '#06b6d4', // cyan - Cash
  '#6b7280', // gray - Other
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium" style={{ color: payload[0].payload.fill }}>
          {payload[0].name}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    )
  }
  return null
}

export default function BreakdownPie({ data }: BreakdownPieProps) {
  const filteredData = data.filter((d) => d.value > 0)

  if (filteredData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Asset Breakdown
        </h3>
        <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
          <p>No assets to display.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Asset Breakdown
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {filteredData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
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
    </div>
  )
}
