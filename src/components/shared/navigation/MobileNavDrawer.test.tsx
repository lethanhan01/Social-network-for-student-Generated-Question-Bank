import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { MobileNavDrawer } from './MobileNavDrawer'

describe('MobileNavDrawer', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { user_id: 1, roles: ['STUDENT'] },
      token: 'test-token',
      isAuthenticated: true,
      hasHydrated: true,
    })
  })
  it('renders drawer content when open and handles close trigger', () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <MemoryRouter>
        <MobileNavDrawer isOpen={false} onClose={onClose} />
      </MemoryRouter>
    )

    expect(screen.queryByText('SQB HUST')).not.toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <MobileNavDrawer isOpen={true} onClose={onClose} />
      </MemoryRouter>
    )

    expect(screen.getByText('SQB HUST')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    const closeBtn = screen.getByRole('button', { name: /đóng/i })
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalled()
  })

  it('renders primary modules and secondary shortcuts inside drawer when open', () => {
    render(
      <MemoryRouter>
        <MobileNavDrawer isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: /mạng xã hội học tập/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /tổng quan học tập/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /luyện đề thi/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /cài đặt hệ thống/i })).toBeInTheDocument()
  })
})
