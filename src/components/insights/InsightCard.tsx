'use client'

interface InsightCardProps {
  insight: {
    id: string
    insightType: string
    title: string
    description: string
    data: Record<string, unknown>
    period: string
  }
  onDismiss: (id: string) => void
}

const TYPE_CONFIG: Record<
  string,
  { icon: JSX.Element; borderColor: string; bgColor: string }
> = {
  trend: {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
    borderColor: 'border-l-blue-500',
    bgColor: 'text-blue-600 dark:text-blue-400',
  },
  spike: {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    ),
    borderColor: 'border-l-orange-500',
    bgColor: 'text-orange-600 dark:text-orange-400',
  },
  recommendation: {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    borderColor: 'border-l-purple-500',
    bgColor: 'text-purple-600 dark:text-purple-400',
  },
  streak: {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
    ),
    borderColor: 'border-l-green-500',
    bgColor: 'text-green-600 dark:text-green-400',
  },
}

export default function InsightCard({ insight, onDismiss }: InsightCardProps) {
  const config = TYPE_CONFIG[insight.insightType] || TYPE_CONFIG.recommendation

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-l-4 ${config.borderColor} rounded-lg shadow-sm p-4 transition-all hover:shadow-md`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 mt-0.5 ${config.bgColor}`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            {insight.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {insight.description}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {insight.period}
          </p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => onDismiss(insight.id)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Dismiss"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
