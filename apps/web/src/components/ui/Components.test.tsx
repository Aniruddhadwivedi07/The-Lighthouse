import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'
import { Badge } from './Badge'
import { Alert } from './Alert'
import { EmptyState, ErrorState } from './FeedbackStates'

describe('Reusable Design System Components', () => {
  it('renders Button with variants and handles clicks', () => {
    const handleClick = vi.fn()
    render(
      <Button variant="primary" onClick={handleClick}>
        Click Me
      </Button>,
    )

    const btn = screen.getByRole('button', { name: /click me/i })
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders Button loading state and disables interaction', () => {
    const handleClick = vi.fn()
    render(
      <Button isLoading onClick={handleClick}>
        Loading Button
      </Button>,
    )

    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    fireEvent.click(btn)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders Badge with semantic variants', () => {
    render(<Badge variant="success">Verified</Badge>)
    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  it('renders Alert and supports dismissal', () => {
    const handleClose = vi.fn()
    render(
      <Alert variant="warning" title="Warning Title" onClose={handleClose}>
        Warning Message
      </Alert>,
    )

    expect(screen.getByText('Warning Title')).toBeInTheDocument()
    expect(screen.getByText('Warning Message')).toBeInTheDocument()

    const dismissBtn = screen.getByRole('button', { name: /dismiss alert/i })
    fireEvent.click(dismissBtn)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('renders EmptyState with action', () => {
    const handleAction = vi.fn()
    render(
      <EmptyState
        title="No Records Found"
        description="Try refining your query filter."
        actionLabel="Clear Filter"
        onAction={handleAction}
      />,
    )

    expect(screen.getByText('No Records Found')).toBeInTheDocument()
    const actionBtn = screen.getByRole('button', { name: /clear filter/i })
    fireEvent.click(actionBtn)
    expect(handleAction).toHaveBeenCalledTimes(1)
  })

  it('renders ErrorState with retry', () => {
    const handleRetry = vi.fn()
    render(
      <ErrorState
        title="Failed to Load"
        message="Backend service unreachable"
        onRetry={handleRetry}
      />,
    )

    expect(screen.getByText('Failed to Load')).toBeInTheDocument()
    const retryBtn = screen.getByRole('button', { name: /try again/i })
    fireEvent.click(retryBtn)
    expect(handleRetry).toHaveBeenCalledTimes(1)
  })
})
