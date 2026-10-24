import React from 'react'
import { cn } from '@/lib/utils'

export interface LighthouseLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const LighthouseLogo: React.FC<LighthouseLogoProps> = ({
  className,
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-xl bg-gradient-to-br from-lighthouse-600 to-lighthouse-900 text-white shadow-sm ring-1 ring-white/20 select-none shrink-0',
        sizeMap[size],
        className,
      )}
      aria-label="Lighthouse brand icon"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3/5 h-3/5 text-amber-400 drop-shadow-sm"
      >
        {/* Lighthouse tower and light beam geometry */}
        <path d="M6 20h12" />
        <path d="M8 20l2-14h4l2 14" />
        <path d="M9 10h6" />
        <path d="M10 6h4" />
        <circle cx="12" cy="4" r="1" fill="#fbbf24" stroke="none" />
        <path d="M4 4l3 3" stroke="#fbbf24" strokeWidth="1.5" />
        <path d="M20 4l-3 3" stroke="#fbbf24" strokeWidth="1.5" />
      </svg>
    </div>
  )
}
