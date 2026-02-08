'use client'

import { useState } from 'react'
import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import NavDropdown from '@/components/NavDropdown'
import NavMobileGroup from '@/components/NavMobileGroup'
import ThemeToggle from '@/components/ThemeToggle'
import AlertBell from '@/components/AlertBell'

const NAV_GROUPS = [
  {
    label: 'Track',
    items: [
      { label: 'Payments', href: '/dashboard' },
      { label: 'Income', href: '/income' },
      { label: 'Recurring', href: '/recurring' },
      { label: 'Subscriptions', href: '/subscriptions' },
      { label: 'Categories', href: '/categories' },
      { label: 'Notes', href: '/notes' },
    ],
  },
  {
    label: 'Invest',
    items: [
      { label: 'Investments', href: '/investments' },
      { label: 'Portfolio', href: '/portfolio' },
      { label: 'Calculators', href: '/calculators' },
    ],
  },
  {
    label: 'Plan',
    items: [
      { label: 'Goals', href: '/goals' },
      { label: 'Loans', href: '/loans' },
      { label: 'Debt Optimizer', href: '/debt-optimizer' },
    ],
  },
  {
    label: 'Analyze',
    items: [
      { label: 'Analytics', href: '/analytics' },
      { label: 'Net Worth', href: '/net-worth' },
      { label: 'Tax Report', href: '/tax-report' },
    ],
  },
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-900/50 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center">
            <span className="hidden md:block"><Logo variant="full" /></span>
            <span className="md:hidden"><Logo variant="icon" /></span>
          </Link>

          {/* Desktop navigation with dropdown menus */}
          <div className="hidden lg:flex items-center gap-1">
            {user && NAV_GROUPS.map((group) => (
              <NavDropdown
                key={group.label}
                label={group.label}
                items={group.items}
                isOpen={openDropdown === group.label}
                onOpen={() => setOpenDropdown(group.label)}
                onClose={() => setOpenDropdown(null)}
              />
            ))}
          </div>

          {/* Desktop right icons */}
          <div className="hidden lg:flex items-center gap-2">
            {user && (
              <>
                <AlertBell />
                <ThemeToggle />
                <Link
                  href="/settings"
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Settings"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
                <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                  {user.user_metadata?.name || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile right icons + hamburger */}
          {user && (
            <div className="lg:hidden flex items-center gap-1">
              <AlertBell />
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Mobile grouped accordion menu */}
        {mobileMenuOpen && user && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="flex flex-col gap-1">
              {NAV_GROUPS.map((group) => (
                <NavMobileGroup
                  key={group.label}
                  label={group.label}
                  items={group.items}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              ))}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-2">
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Settings
                </Link>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {user.user_metadata?.name || user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors py-2 w-full"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
