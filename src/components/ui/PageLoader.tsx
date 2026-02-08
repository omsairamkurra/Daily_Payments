'use client'

import Spinner from './Spinner'

export default function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-gray-600 dark:text-gray-300 font-medium">OSRK Payments</p>
      </div>
    </div>
  )
}
