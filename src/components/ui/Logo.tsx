'use client'

interface LogoProps {
  variant?: 'full' | 'icon'
}

export default function Logo({ variant = 'full' }: LogoProps) {
  const icon = (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
      >
        OSRK
      </text>
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
    </svg>
  )

  if (variant === 'icon') {
    return icon
  }

  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-xl font-bold text-blue-600">OSRK Payments</span>
    </div>
  )
}
