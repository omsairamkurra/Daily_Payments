'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { calculateLumpSum } from '@/lib/financial-math'
import { useSettings } from '@/lib/settings-context'

interface ReturnProjectionChartProps {
  initialAmount: number
  years: number
  scenarios: number[] // e.g., [8, 12, 15]
}

const COLORS = ['#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ef4444']

export default function ReturnProjectionChart({ initialAmount, years, scenarios }: ReturnProjectionChartProps) {
  const { formatCurrency } = useSettings()

  const data = useMemo(() => {
    const points = []
    for (let year = 0; year <= years; year++) {
      const point: Record<string, number | string> = { year: `Year ${year}` }
      scenarios.forEach((rate) => {
        point[`${rate}%`] = Math.round(calculateLumpSum(initialAmount, year, rate))
      })
      points.push(point)
    }
    return points
  }, [initialAmount, years, scenarios])

  const formatYAxis = (value: number) => {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return String(value)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Return Projections</h4>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {scenarios.map((rate, i) => (
              <linearGradient key={rate} id={`colorScenario${rate}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.2} />
                <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            dataKey="year"
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
            formatter={(value) => [formatCurrency(Number(value)), undefined]}
          />
          <Legend />
          {scenarios.map((rate, i) => (
            <Area
              key={rate}
              type="monotone"
              dataKey={`${rate}%`}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              fill={`url(#colorScenario${rate})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
