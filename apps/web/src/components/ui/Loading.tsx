import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export const Spinner: React.FC<SpinnerProps> = ({
  className,
  size = 'md',
  label = 'Loading...',
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center justify-center text-lighthouse-600', className)}
      {...props}
    >
      <Loader2 className={cn('animate-spin', sizeStyles[size])} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200/80', className)}
      {...props}
    />
  )
}

export interface LoadingOverlayProps {
  message?: string
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading data...',
}) => {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center p-8 space-y-3 min-h-[160px]"
    >
      <Spinner size="lg" label={message} />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  )
}
