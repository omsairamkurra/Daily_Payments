'use client'

interface MilestoneBadgesProps {
  milestones: Array<{ milestoneType: number; achievedAt: string | null }>
  currentPercent: number
}

const THRESHOLDS = [25, 50, 75, 100]

export default function MilestoneBadges({ milestones, currentPercent }: MilestoneBadgesProps) {
  const achievedTypes = new Set(
    milestones
      .filter((m) => m.achievedAt !== null)
      .map((m) => m.milestoneType)
  )

  return (
    <div className="flex flex-row gap-3">
      {THRESHOLDS.map((threshold) => {
        const isAchieved = achievedTypes.has(threshold)

        return (
          <div
            key={threshold}
            className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
              isAchieved
                ? 'bg-yellow-400 text-yellow-900 border-yellow-500 shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-600'
            }`}
            title={
              isAchieved
                ? `${threshold}% milestone achieved!`
                : `${threshold}% - ${currentPercent >= threshold ? 'Reached' : `${(threshold - currentPercent).toFixed(1)}% to go`}`
            }
          >
            {isAchieved ? (
              <div className="flex flex-col items-center">
                <svg
                  className="w-4 h-4 mb-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-[10px] font-bold leading-none">{threshold}%</span>
              </div>
            ) : (
              <span className="text-xs font-semibold">{threshold}%</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
