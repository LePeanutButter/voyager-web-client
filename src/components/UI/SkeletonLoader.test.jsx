import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SkeletonLoader, { StatCardSkeleton, TravelCardSkeleton, ChatMessageSkeleton } from './SkeletonLoader'

describe('SkeletonLoader', () => {
  it('single and multi count', () => {
    const { container } = render(<SkeletonLoader variant="text" />)
    expect(container.querySelector('.skeleton')).toBeTruthy()
    const { container: c2 } = render(<SkeletonLoader variant="text" count={3} />)
    expect(c2.querySelectorAll('.skeleton').length).toBeGreaterThanOrEqual(3)
  })

  it('prebuilt skeletons', () => {
    render(<StatCardSkeleton />)
    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument()
    render(<TravelCardSkeleton />)
    render(<ChatMessageSkeleton isUser />)
  })
})
