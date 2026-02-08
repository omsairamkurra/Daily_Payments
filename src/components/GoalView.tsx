'use client'

import ViewModal from './ui/ViewModal'

interface Goal {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
  deadline: string | null
  notes: string | null
}

interface GoalViewProps {
  goal: Goal
  onClose: () => void
  onEdit: () => void
}

export default function GoalView({ goal, onClose, onEdit }: GoalViewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const progress = goal.targetAmount > 0
    ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100)
    : 0
  const remaining = goal.targetAmount - goal.savedAmount

  return (
    <ViewModal title="Goal Details" onClose={onClose} onEdit={onEdit}>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Name</span>
        <span className="text-sm font-medium text-gray-900">{goal.name}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Target Amount</span>
        <span className="text-sm font-bold text-gray-900">{formatCurrency(goal.targetAmount)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Saved Amount</span>
        <span className="text-sm font-bold text-green-600">{formatCurrency(goal.savedAmount)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Remaining</span>
        <span className="text-sm font-medium text-gray-900">{formatCurrency(remaining > 0 ? remaining : 0)}</span>
      </div>
      <div>
        <span className="text-sm text-gray-500">Progress</span>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-right text-blue-600 font-medium mt-1">{progress.toFixed(1)}%</p>
      </div>
      {goal.deadline && (
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Deadline</span>
          <span className="text-sm font-medium text-gray-900">
            {new Date(goal.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      )}
      {goal.notes && (
        <div>
          <span className="text-sm text-gray-500">Notes</span>
          <p className="text-sm text-gray-700 mt-1">{goal.notes}</p>
        </div>
      )}
    </ViewModal>
  )
}
