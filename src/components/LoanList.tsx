'use client'

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

interface LoanListProps {
  loans: Loan[]
  onView: (loan: Loan) => void
  onEdit: (loan: Loan) => void
  onDelete: (id: string) => void
}

export default function LoanList({
  loans,
  onView,
  onEdit,
  onDelete,
}: LoanListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loans.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-gray-500">No loans yet. Add your first loan!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {loans.map((loan) => {
        const progressPercent = loan.tenureMonths > 0
          ? Math.min((loan.paidEmis / loan.tenureMonths) * 100, 100)
          : 0
        const remainingEmis = loan.tenureMonths - loan.paidEmis
        const remainingAmount = remainingEmis * loan.emiAmount

        return (
          <div
            key={loan.id}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {loan.name}
                </h3>
                {loan.bank && (
                  <p className="text-sm text-gray-500">{loan.bank}</p>
                )}
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                {loan.interestRate}%
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Loan Amount</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(loan.loanAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">EMI Amount</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(loan.emiAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Interest Rate</span>
                <span className="font-medium text-gray-900">
                  {loan.interestRate}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-600">
                  {loan.paidEmis} of {loan.tenureMonths} EMIs paid
                </p>
                <p className="text-xs font-medium text-gray-700">
                  {progressPercent.toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <p>
                Remaining: ~{formatCurrency(remainingAmount)}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => onView(loan)}
                className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
              >
                View
              </button>
              <button
                onClick={() => onEdit(loan)}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (
                    confirm('Are you sure you want to delete this loan?')
                  ) {
                    onDelete(loan.id)
                  }
                }}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
