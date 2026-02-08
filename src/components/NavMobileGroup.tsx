'use client'

import { useState } from 'react'
import Link from 'next/link'

interface NavItem {
  label: string
  href: string
}

interface NavMobileGroupProps {
  label: string
  items: NavItem[]
  onNavigate: () => void
}

export default function NavMobileGroup({ label, items, onNavigate }: NavMobileGroupProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
      >
        {label}
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="pl-3 space-y-1 pb-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
