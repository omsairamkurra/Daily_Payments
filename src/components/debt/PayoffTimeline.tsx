'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ScheduleEntry {
  month: number
  balances: Record<string, number>
}

interface PayoffTimelineProps {
  avalancheSchedule: ScheduleEntry[]
  snowballSchedule: ScheduleEntry[]
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(1)}L`
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`
  }
  return amount.toFixed(0)
}

function formatTooltipValue(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function PayoffTimeline({
  avalancheSchedule,
  snowballSchedule,
}: PayoffTimelineProps) {
  const chartData = useMemo(() => {
    const allMonths = new Set<number>()

    avalancheSchedule.forEach((e) => allMonths.add(e.month))
    snowballSchedule.forEach((e) => allMonths.add(e.month))

    // Add month 0 entry
    allMonths.add(0)

    const sortedMonths = Array.from(allMonths).sort((a, b) => a - b)

    // Build lookup maps
    const avalancheMap = new Map<number, number>()
    const snowballMap = new Map<number, number>()

    avalancheSchedule.forEach((e) => {
      const total = Object.values(e.balances).reduce((sum, b) => sum + Math.max(0, b), 0)
      avalancheMap.set(e.month, total)
    })

    snowballSchedule.forEach((e) => {
      const total = Object.values(e.balances).reduce((sum, b) => sum + Math.max(0, b), 0)
      snowballMap.set(e.month, total)
    })

    // Get the starting total from the first entry context or fallback
    const firstAvalanche = avalancheSchedule[0]
    const firstSnowball = snowballSchedule[0]
    const startingAvalanche = firstAvalanche
      ? Object.values(firstAvalanche.balances).reduce((sum, b) => sum + Math.max(0, b), 0) * 1.1
      : 0
    const startingSnowball = firstSnowball
      ? Object.values(firstSnowball.balances).reduce((sum, b) => sum + Math.max(0, b), 0) * 1.1
      : 0

    let lastAvalanche = Math.max(startingAvalanche, startingSnowball)
    let lastSnowball = Math.max(startingAvalanche, startingSnowball)

    return sortedMonths.map((month) => {
      if (month === 0) {
        return {
          month: 0,
          label: 'Now',
          avalanche: lastAvalanche,
          snowball: lastSnowball,
        }
      }

      const aVal = avalancheMap.get(month)
      if (aVal !== undefined) lastAvalanche = aVal
      const sVal = snowballMap.get(month)
      if (sVal !== undefined) lastSnowball = sVal

      const years = Math.floor(month / 12)
      const remainingMonths = month % 12
      const label = years > 0
        ? `${years}y ${remainingMonths}m`
        : `${remainingMonths}m`

      return {
        month,
        label,
        avalanche: Math.max(0, lastAvalanche),
        snowball: Math.max(0, lastSnowball),
      }
    })
  }, [avalancheSchedule, snowballSchedule])

  if (chartData.length <= 1) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Payoff Timeline
      </h2>
      <div className="h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="avalancheGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="snowballGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#D1D5DB' }}
            />
            <YAxis
              tickFormatter={(v) => formatCurrency(v)}
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#D1D5DB' }}
              width={60}
            />
            <Tooltip
              formatter={(value, name) => [
                formatTooltipValue(Number(value)),
                name === 'avalanche' ? 'Avalanche' : 'Snowball',
              ]}
              labelFormatter={(label) => `Month: ${label}`}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#F9FAFB',
                fontSize: '12px',
              }}
            />
            <Legend
              formatter={(value) => (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {value === 'avalanche' ? 'Avalanche' : 'Snowball'}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="avalanche"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#avalancheGrad)"
            />
            <Area
              type="monotone"
              dataKey="snowball"
              stroke="#F97316"
              strokeWidth={2}
              fill="url(#snowballGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
