import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { TopbarNav } from './TopbarNav'

describe('TopbarNav', () => {
  it('renders all 5 main navigation links as Facebook-style icon slots with accessible names', () => {
    render(
      <MemoryRouter initialEntries={['/feed']}>
        <TopbarNav />
      </MemoryRouter>
    )

    const nav = screen.getByRole('navigation', { name: /thanh điều hướng chính/i })
    expect(nav).toBeInTheDocument()

    const feedLink = screen.getByRole('link', { name: /mạng xã hội học tập/i })
    expect(feedLink).toHaveAttribute('href', '/feed')
    expect(feedLink).toHaveClass('text-action-accent', 'border-b-[3px]', 'border-action-accent')

    const friendsLink = screen.getByRole('link', { name: /bạn bè & kết nối/i })
    expect(friendsLink).toHaveAttribute('href', '/friends')
    expect(friendsLink).toHaveClass('border-transparent')

    const questionsLink = screen.getByRole('link', { name: /ngân hàng câu hỏi/i })
    expect(questionsLink).toHaveAttribute('href', '/questions')

    const shopLink = screen.getByRole('link', { name: /cửa hàng & túi đồ/i })
    expect(shopLink).toHaveAttribute('href', '/shop')

    const minigamesLink = screen.getByRole('link', { name: /đấu trường minigame/i })
    expect(minigamesLink).toHaveAttribute('href', '/gamification/minigames')
  })
})
