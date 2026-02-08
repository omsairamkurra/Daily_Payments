'use client'

import ViewModal from './ui/ViewModal'

interface Investment {
  id: string
  name: string
  type: string
  app: string
  investedAmount: number
  currentValue: number | null
  units: number | null
  purchaseDate: string
  notes: string | null
  frequency?: string
  isSip?: boolean
  sipAmount?: number | null
  nextSipDate?: string | null
  goalId?: string | null
}

interface InvestmentViewProps {
  investment: Investment
  onClose: () => void
  onEdit: () => void
}

const TYPE_LABELS: Record<string, string> = {
  mutual_fund: 'Mutual Fund',
  stock: 'Stock',
  sip: 'SIP',
  fd: 'FD',
  ppf: 'PPF',
  gold: 'Gold',
  silver: 'Silver',
  other: 'Other',
}

export default function InvestmentView({ investment, onClose, onEdit }: InvestmentViewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const gainLoss = investment.currentValue !== null
    ? investment.currentValue - investment.investedAmount
    : null

  const gainLossPercent = gainLoss !== null && investment.investedAmount > 0
    ? ((gainLoss / investment.investedAmount) * 100).toFixed(2)
    : null

  return (
    <ViewModal title="Investment Details" onClose={onClose} onEdit={onEdit}>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Name</span>
        <span className="text-sm font-medium text-gray-900">{investment.name}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Type</span>
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
          {TYPE_LABELS[investment.type] || investment.type}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">App</span>
        <span className="text-sm font-medium text-gray-900">{investment.app || 'N/A'}</span>
      </div>
      {investment.frequency && investment.frequency !== 'one_time' && (
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Frequency</span>
          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded capitalize">
            {investment.frequency.replace('_', ' ')}
          </span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Invested Amount</span>
        <span className="text-sm font-bold text-gray-900">{formatCurrency(investment.investedAmount)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Current Value</span>
        <span className="text-sm font-medium text-gray-900">
          {investment.currentValue !== null ? formatCurrency(investment.currentValue) : 'N/A'}
        </span>
      </div>
      {gainLoss !== null && (
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Gain/Loss</span>
          <span className={`text-sm font-bold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)} ({gainLossPercent}%)
          </span>
        </div>
      )}
      {investment.units && (
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Units</span>
          <span className="text-sm font-medium text-gray-900">{investment.units}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Purchase Date</span>
        <span className="text-sm font-medium text-gray-900">
          {new Date(investment.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
      {investment.sipAmount && (
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">SIP Amount</span>
          <span className="text-sm font-medium text-gray-900">{formatCurrency(investment.sipAmount)}</span>
        </div>
      )}
      {investment.nextSipDate && (
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Next SIP Date</span>
          <span className="text-sm font-medium text-gray-900">
            {new Date(investment.nextSipDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      )}
      {investment.notes && (
        <div>
          <span className="text-sm text-gray-500">Notes</span>
          <p className="text-sm text-gray-700 mt-1">{investment.notes}</p>
        </div>
      )}
    </ViewModal>
  )
}
