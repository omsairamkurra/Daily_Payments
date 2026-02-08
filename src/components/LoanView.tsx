'use client'

import ViewModal from './ui/ViewModal'

interface Loan {
  id: string
  name: string
  bank: string
  loanAmount: number
  emiAmount: number
  interestRate: number
  tenureMonths: number
  startDate: string
  paidEmis: number
  notes: string | null
}

interface LoanViewProps {
  loan: Loan
  onClose: () => void
  onEdit: () => void
}

export default function LoanView({ loan, onClose, onEdit }: LoanViewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const progressPercent = loan.tenureMonths > 0
    ? Math.min((loan.paidEmis / loan.tenureMonths) * 100, 100)
    : 0
  const remainingEmis = loan.tenureMonths - loan.paidEmis
  const remainingAmount = remainingEmis * loan.emiAmount

  return (
    <ViewModal title="Loan Details" onClose={onClose} onEdit={onEdit}>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Name</span>
        <span className="text-sm font-medium text-gray-900">{loan.name}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Bank</span>
        <span className="text-sm font-medium text-gray-900">{loan.bank || 'N/A'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Loan Amount</span>
        <span className="text-sm font-bold text-gray-900">{formatCurrency(loan.loanAmount)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">EMI Amount</span>
        <span className="text-sm font-medium text-gray-900">{formatCurrency(loan.emiAmount)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Interest Rate</span>
        <span className="text-sm font-medium text-gray-900">{loan.interestRate}%</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Tenure</span>
        <span className="text-sm font-medium text-gray-900">{loan.tenureMonths} months</span>
      </div>
      <div>
        <span className="text-sm text-gray-500">EMI Progress</span>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-600">{loan.paidEmis} of {loan.tenureMonths} EMIs paid</p>
          <p className="text-xs font-medium text-gray-700">{progressPercent.toFixed(0)}%</p>
        </div>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Remaining EMIs</span>
        <span className="text-sm font-medium text-gray-900">{remainingEmis > 0 ? remainingEmis : 0}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Remaining Amount</span>
        <span className="text-sm font-medium text-gray-900">{formatCurrency(remainingAmount > 0 ? remainingAmount : 0)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Start Date</span>
        <span className="text-sm font-medium text-gray-900">
          {new Date(loan.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
      {loan.notes && (
        <div>
          <span className="text-sm text-gray-500">Notes</span>
          <p className="text-sm text-gray-700 mt-1">{loan.notes}</p>
        </div>
      )}
    </ViewModal>
  )
}
