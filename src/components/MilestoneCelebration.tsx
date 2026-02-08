'use client'

import { useEffect } from 'react'

interface MilestoneCelebrationProps {
  milestoneType: number
  onDismiss: () => void
}

const milestoneMessages: Record<number, string> = {
  25: 'Great start! A quarter of the way there!',
  50: 'Halfway there! Keep up the amazing work!',
  75: 'Almost there! Just a little more to go!',
  100: 'Congratulations! You reached your goal!',
}

const milestoneEmojis: Record<number, string> = {
  25: '🌱',
  50: '⭐',
  75: '🔥',
  100: '🎉',
}

export default function MilestoneCelebration({
  milestoneType,
  onDismiss,
}: MilestoneCelebrationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]"
      onClick={onDismiss}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm mx-4 text-center animate-celebration"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-4 animate-bounce">
          {milestoneEmojis[milestoneType] || '🎯'}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Milestone Reached!
        </h2>

        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-400 text-yellow-900 border-4 border-yellow-500 mb-4">
          <span className="text-xl font-bold">{milestoneType}%</span>
        </div>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
          You reached {milestoneType}% of your goal!
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {milestoneMessages[milestoneType] || 'Keep going!'}
        </p>

        <button
          onClick={onDismiss}
          className="px-6 py-2 bg-yellow-500 text-yellow-900 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
        >
          Awesome!
        </button>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
          Auto-dismissing in 3 seconds...
        </p>
      </div>

      <style jsx>{`
        @keyframes celebrationIn {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-celebration {
          animation: celebrationIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
