'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            Daily Payments
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-4">
            {session?.user && (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Payments
                </Link>
                <Link
                  href="/notes"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Notes
                </Link>
                <Link
                  href="/investments"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Investments
                </Link>
                <span className="text-gray-600">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger button */}
          {session?.user && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          )}
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && session?.user && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 hover:text-blue-600 transition-colors py-2"
              >
                Payments
              </Link>
              <Link
                href="/notes"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 hover:text-blue-600 transition-colors py-2"
              >
                Notes
              </Link>
              <Link
                href="/investments"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 hover:text-blue-600 transition-colors py-2"
              >
                Investments
              </Link>
              <div className="border-t border-gray-200 pt-3 mt-2">
                <span className="text-gray-600 text-sm">
                  {session.user.name || session.user.email}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors py-2"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
