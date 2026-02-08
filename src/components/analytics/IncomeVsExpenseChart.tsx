'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface IncomeVsExpenseChartProps {
  data: Array<{ month: string; income: number; expenses: number }>
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

export default function IncomeVsExpenseChart({ data }: IncomeVsExpenseChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    monthLabel: formatMonth(d.month),
  }))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Income vs Expenses
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
            formatter={(value, name) => [
              new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(Number(value)),
              name === 'income' ? 'Income' : 'Expenses',
            ]}
            labelStyle={{ color: '#9CA3AF' }}
          />
          <Legend
            formatter={(value: string) => (
              <span style={{ color: '#9CA3AF', fontSize: '12px' }}>
                {value === 'income' ? 'Income' : 'Expenses'}
              </span>
            )}
          />
          <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
