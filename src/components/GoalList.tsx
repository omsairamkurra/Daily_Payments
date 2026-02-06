'use client'

interface Goal {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
  deadline: string | null
  notes: string | null
}

interface GoalListProps {
  goals: Goal[]
  onEdit: (goal: Goal) => void
  onDelete: (id: string) => void
}

export default function GoalList({
  goals,
  onEdit,
  onDelete,
}: GoalListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  if (goals.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-gray-500">No savings goals yet. Set your first goal!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals.map((goal) => {
        const progress = goal.targetAmount > 0
          ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100)
          : 0
        const remaining = goal.targetAmount - goal.savedAmount

        return (
          <div
            key={goal.id}
            className="bg-white rounded-xl shadow-md p-6 flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {goal.name}
              </h3>
              {goal.deadline && isOverdue(goal.deadline) && goal.savedAmount < goal.targetAmount && (
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                  Overdue
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                {formatCurrency(goal.savedAmount)} saved of {formatCurrency(goal.targetAmount)}
              </p>
              <p className="text-sm font-medium text-blue-600">
                {progress.toFixed(1)}%
              </p>
            </div>

            <div className="space-y-2 mb-4 flex-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Remaining:</span>{' '}
                {formatCurrency(remaining > 0 ? remaining : 0)}
              </p>
              {goal.deadline && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Deadline:</span>{' '}
                  {formatDate(goal.deadline)}
                </p>
              )}
              {goal.notes && (
                <p className="text-sm text-gray-500 italic">
                  {goal.notes}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => onEdit(goal)}
                className="flex-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this goal?')) {
                    onDelete(goal.id)
                  }
                }}
                className="flex-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors font-medium"
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
