'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DailySpendingChartProps {
  data: Array<{ day: string; amount: number }>
}

function formatDay(day: string): string {
  const date = new Date(day)
  return date.getDate().toString()
}

function formatCurrency(value: number): string {
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toString()
}

export default function DailySpendingChart({ data }: DailySpendingChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    dayLabel: formatDay(d.day),
  }))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Daily Spending (This Month)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            dataKey="dayLabel"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            axisLine={{ stroke: '#4B5563' }}
            interval="preserveStartEnd"
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
            labelFormatter={(label) => `Day ${label}`}
            labelStyle={{ color: '#9CA3AF' }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={{ fill: '#F59E0B', r: 3 }}
            activeDot={{ r: 5, fill: '#F59E0B' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
