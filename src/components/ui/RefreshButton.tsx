'use client'

interface RefreshButtonProps {
  onClick: () => void
  isRefreshing: boolean
}

export default function RefreshButton({ onClick, isRefreshing }: RefreshButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isRefreshing}
      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
      title="Refresh"
    >
      <svg
        className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </button>
  )
}
