'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SpendingTrendChartProps {
  data: Array<{ month: string; total: number }>
}

function formatMonth(month: string): string {
  const [year, m] = month.split('-')
  const date = new Date(parseInt(year), parseInt(m) - 1)
  return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
}

function formatCurrency(value: number): string {
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toString()
}

export default function SpendingTrendChart({ data }: SpendingTrendChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    monthLabel: formatMonth(d.month),
  }))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Spending Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            dataKey="monthLabel"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            axisLine={{ stroke: '#4B5563' }}
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
            formatter={(value) => [
              new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(Number(value)),
              'Spending',
            ]}
            labelStyle={{ color: '#9CA3AF' }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#spendingGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
