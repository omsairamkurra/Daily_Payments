'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useSettings } from '@/lib/settings-context'

interface GrowthChartProps {
  data: Array<{ date: string; value: number; invested: number }>
}

export default function GrowthChart({ data }: GrowthChartProps) {
  const { formatCurrency } = useSettings()

  const formatYAxis = (value: number) => {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return String(value)
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Portfolio Growth Over Time
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Not enough data to display growth chart.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Portfolio Growth Over Time
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#f9fafb',
            }}
            formatter={(value, name) => [
              formatCurrency(Number(value)),
              name === 'invested' ? 'Invested' : 'Current Value',
            ]}
            labelStyle={{ color: '#9ca3af' }}
          />
          <Legend
            formatter={(value: string) => (
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {value === 'invested' ? 'Invested' : 'Current Value'}
              </span>
            )}
          />
          <Area
            type="monotone"
            dataKey="invested"
            stroke="#9CA3AF"
            strokeWidth={2}
            fill="url(#colorInvested)"
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#22C55E"
            strokeWidth={2}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
