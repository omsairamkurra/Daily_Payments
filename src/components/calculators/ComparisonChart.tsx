'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { calculateSIPMaturity, calculateLumpSum } from '@/lib/financial-math'
import { useSettings } from '@/lib/settings-context'

interface ComparisonChartProps {
  sipMonthly: number
  lumpSumAmount: number
  years: number
  returnPercent: number
}

export default function ComparisonChart({ sipMonthly, lumpSumAmount, years, returnPercent }: ComparisonChartProps) {
  const { formatCurrency } = useSettings()

  const data = useMemo(() => {
    const points = []
    for (let year = 0; year <= years; year++) {
      const sipValue = year === 0 ? 0 : calculateSIPMaturity(sipMonthly, year, returnPercent)
      const lumpSumValue = calculateLumpSum(lumpSumAmount, year, returnPercent)
      points.push({
        year: `Year ${year}`,
        SIP: Math.round(sipValue),
        'Lump Sum': Math.round(lumpSumValue),
      })
    }
    return points
  }, [sipMonthly, lumpSumAmount, years, returnPercent])

  const formatYAxis = (value: number) => {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return String(value)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">SIP vs Lump Sum Growth</h4>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSip" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLumpSum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
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
          <Area
            type="monotone"
            dataKey="SIP"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#colorSip)"
          />
          <Area
            type="monotone"
            dataKey="Lump Sum"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorLumpSum)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
