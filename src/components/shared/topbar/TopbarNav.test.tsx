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
    expect(feedLink).toHaveClass('text-action-accent', 'border-b-2', 'border-action-accent')
    expect(feedLink).toHaveAttribute('aria-current', 'page')

    const friendsLink = screen.getByRole('link', { name: /bạn bè & kết nối/i })
    expect(friendsLink).toHaveAttribute('href', '/friends')
    expect(friendsLink).toHaveClass('border-transparent')

    const questionsLink = screen.getByRole('link', { name: /ngân hàng câu hỏi/i })
    expect(questionsLink).toHaveAttribute('href', '/student/subjects')

    const examsLink = screen.getByRole('link', { name: /ngân hàng đề thi/i })
    expect(examsLink).toHaveAttribute('href', '/student/practice')

    const minigamesLink = screen.getByRole('link', { name: /đấu trường minigame/i })
    expect(minigamesLink).toHaveAttribute('href', '/student/gamification/minigames')
  })
})
