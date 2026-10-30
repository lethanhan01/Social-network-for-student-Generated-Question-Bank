import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { Topbar } from './Topbar'

describe('Topbar', () => {
  it('renders a full-width fixed header with solid surface token (bg-surface-card) and border', () => {
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>
    )

    const header = screen.getByRole('banner')
    expect(header).toHaveClass(
      'fixed',
      'top-0',
      'left-0',
      'right-0',
      'z-20',
      'h-16',
      'bg-surface-card',
      'border-b',
      'border-line-subtle'
    )
    expect(header).not.toHaveClass('bg-transparent')

    expect(screen.getByRole('link', { name: /sqb hust/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /menu người dùng/i })).toBeInTheDocument()
  })

  it('renders and toggles mobile menu button when onToggleMobileMenu is provided', () => {
    const onToggle = vi.fn()
    const { rerender } = render(
      <MemoryRouter>
        <Topbar isMobileMenuOpen={false} onToggleMobileMenu={onToggle} />
      </MemoryRouter>
    )

    const openBtn = screen.getByRole('button', { name: /mở menu/i })
    expect(openBtn).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(openBtn)
    expect(onToggle).toHaveBeenCalledTimes(1)

    rerender(
      <MemoryRouter>
        <Topbar isMobileMenuOpen={true} onToggleMobileMenu={onToggle} />
      </MemoryRouter>
    )

    const closeBtn = screen.getByRole('button', { name: /đóng menu/i })
    expect(closeBtn).toHaveAttribute('aria-expanded', 'true')
  })
})

