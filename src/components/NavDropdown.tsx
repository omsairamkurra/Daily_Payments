'use client'

import Link from 'next/link'

interface NavItem {
  label: string
  href: string
}

interface NavDropdownProps {
  label: string
  items: NavItem[]
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export default function NavDropdown({ label, items, isOpen, onOpen, onClose }: NavDropdownProps) {
  return (
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        onClick={isOpen ? onClose : onOpen}
        className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1 rounded"
      >
        {label}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
