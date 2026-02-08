'use client'

import { useState, useMemo } from 'react'
import { useSettings } from '@/lib/settings-context'

interface Investment {
  id: string
  name: string
  type: string
  app: string
  invested: number
  current: number
  gainLoss: number
  gainLossPercent: number
  cagr: number
}

interface PerformanceTableProps {
  investments: Investment[]
}

type SortField = 'name' | 'type' | 'invested' | 'current' | 'gainLoss' | 'gainLossPercent' | 'cagr'
type SortDir = 'asc' | 'desc'

export default function PerformanceTable({ investments }: PerformanceTableProps) {
  const { formatCurrency } = useSettings()
  const [sortField, setSortField] = useState<SortField>('gainLossPercent')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const sorted = useMemo(() => {
    return [...investments].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      const aNum = aVal as number
      const bNum = bVal as number
      return sortDir === 'asc' ? aNum - bNum : bNum - aNum
    })
  }, [investments, sortField, sortDir])

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return ' \u2195'
    return sortDir === 'asc' ? ' \u2191' : ' \u2193'
  }

  const gainColor = (value: number) =>
    value >= 0 ? 'text-green-600' : 'text-red-600'

  const formatPercent = (value: number) =>
    `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`

  if (!investments || investments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Investment Performance
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No investments to display.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Investment Performance
      </h3>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {[
                { field: 'name' as SortField, label: 'Name' },
                { field: 'type' as SortField, label: 'Type' },
                { field: 'invested' as SortField, label: 'Invested' },
                { field: 'current' as SortField, label: 'Current' },
                { field: 'gainLoss' as SortField, label: 'Gain/Loss' },
                { field: 'gainLossPercent' as SortField, label: 'Gain %' },
                { field: 'cagr' as SortField, label: 'CAGR %' },
              ].map(({ field, label }) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className="py-3 px-3 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 select-none whitespace-nowrap"
                >
                  {label}
                  <span className="text-xs">{sortIcon(field)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((inv) => (
              <tr
                key={inv.id}
                className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td className="py-3 px-3 font-medium text-gray-900 dark:text-white">
                  {inv.name}
                </td>
                <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                  {inv.type}
                </td>
                <td className="py-3 px-3 text-gray-900 dark:text-white">
                  {formatCurrency(inv.invested)}
                </td>
                <td className="py-3 px-3 text-gray-900 dark:text-white">
                  {formatCurrency(inv.current)}
                </td>
                <td className={`py-3 px-3 font-medium ${gainColor(inv.gainLoss)}`}>
                  {inv.gainLoss >= 0 ? '+' : ''}
                  {formatCurrency(inv.gainLoss)}
                </td>
                <td className={`py-3 px-3 font-medium ${gainColor(inv.gainLossPercent)}`}>
                  {formatPercent(inv.gainLossPercent)}
                </td>
                <td className={`py-3 px-3 font-medium ${gainColor(inv.cagr)}`}>
                  {formatPercent(inv.cagr)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        <div className="flex gap-2 mb-3 flex-wrap">
          <span className="text-xs text-gray-500 dark:text-gray-400 self-center">Sort:</span>
          {[
            { field: 'name' as SortField, label: 'Name' },
            { field: 'gainLossPercent' as SortField, label: 'Return' },
            { field: 'cagr' as SortField, label: 'CAGR' },
            { field: 'invested' as SortField, label: 'Invested' },
          ].map(({ field, label }) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                sortField === field
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {label}
              {sortField === field && (
                <span className="ml-0.5">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>
              )}
            </button>
          ))}
        </div>

        {sorted.map((inv) => (
          <div
            key={inv.id}
            className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-4 space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{inv.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{inv.type} &middot; {inv.app}</p>
              </div>
              <span className={`text-sm font-bold ${gainColor(inv.gainLossPercent)}`}>
                {formatPercent(inv.gainLossPercent)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Invested</p>
                <p className="text-gray-900 dark:text-white">{formatCurrency(inv.invested)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Current</p>
                <p className="text-gray-900 dark:text-white">{formatCurrency(inv.current)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Gain/Loss</p>
                <p className={`font-medium ${gainColor(inv.gainLoss)}`}>
                  {inv.gainLoss >= 0 ? '+' : ''}{formatCurrency(inv.gainLoss)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">CAGR</p>
                <p className={`font-medium ${gainColor(inv.cagr)}`}>
                  {formatPercent(inv.cagr)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
