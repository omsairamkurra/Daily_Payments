'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface NetWorthTrendChartProps {
  data: Array<{ date: string; netWorth: number; assets: number; liabilities: number }>
}

const formatCurrency = (value: number) => {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toFixed(0)
}

const formatFullCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {new Date(label || '').toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
        {payload.map((entry, index: number) => (
          <p
            key={index}
            className="text-sm"
            style={{ color: entry.color }}
          >
            {entry.name}: {formatFullCurrency(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function NetWorthTrendChart({ data }: NetWorthTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Net Worth Trend
        </h3>
        <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
          <p>No snapshot data yet. Take your first snapshot to see trends.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Net Worth Trend
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="assets"
              name="Assets"
              stroke="#22c55e"
              fill="url(#colorAssets)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="netWorth"
              name="Net Worth"
              stroke="#3b82f6"
              fill="url(#colorNetWorth)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="liabilities"
              name="Liabilities"
              stroke="#ef4444"
              fill="none"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
