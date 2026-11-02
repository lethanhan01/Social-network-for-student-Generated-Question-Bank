import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { BottomNavBar } from './BottomNavBar'

describe('BottomNavBar', () => {
  it('renders fixed bottom navigation bar on mobile with 5 pure icon links without visible text', () => {
    render(
      <MemoryRouter initialEntries={['/feed']}>
        <BottomNavBar />
      </MemoryRouter>
    )

    const nav = screen.getByRole('navigation', { name: /điều hướng di động/i })
    expect(nav).toHaveClass('fixed', 'bottom-0', 'md:hidden')

    // Accessible names exist via aria-label
    const feedLink = screen.getByRole('link', { name: /mạng xã hội học tập/i })
    expect(feedLink).toBeInTheDocument()
    expect(feedLink).toHaveClass('text-action-accent')

    expect(screen.getByRole('link', { name: /bạn bè & kết nối/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ngân hàng câu hỏi/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ngân hàng đề thi/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /đấu trường minigame/i })).toBeInTheDocument()

    // No visible text inside the links
    expect(feedLink.textContent).toBe('')
  })
})
