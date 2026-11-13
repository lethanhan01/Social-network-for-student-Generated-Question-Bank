import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import DashboardLayout from './DashboardLayout'

describe('DashboardLayout — Topbar Navigation & Responsive Architecture', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { user_id: 1, roles: ['STUDENT'] },
      token: 'test-token',
      isAuthenticated: true,
      hasHydrated: true,
    })
  })
  function renderLayout() {
    return render(
      <MemoryRouter initialEntries={['/dashboard']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<h1>Trang tổng quan</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
  }

  it('renders fixed Topbar at top-0 and provides full-width main container without sidebar offset', () => {
    renderLayout()

    const topbar = screen.getByRole('banner')
    expect(topbar).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'h-16', 'bg-surface-card')

    const main = screen.getByRole('main')
    expect(main).toHaveClass('flex-1', 'w-full', 'pb-20', 'md:pb-6')
    expect(main.parentElement).not.toHaveClass('md:pl-18')
    expect(main.parentElement).toHaveClass('pt-16')
  })

  it('renders mobile BottomNavBar fixed at bottom-0 and hidden on md screens', () => {
    renderLayout()

    const bottomNav = screen.getByRole('navigation', { name: /điều hướng di động/i })
    expect(bottomNav).toHaveClass('fixed', 'bottom-0', 'md:hidden', 'h-16', 'bg-surface-card')
  })

  it('toggles MobileNavDrawer via Topbar hamburger button', () => {
    renderLayout()

    const toggleBtn = screen.getByRole('button', { name: /mở menu/i })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(toggleBtn)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    const closeBtn = screen.getByRole('button', { name: /đóng/i })
    fireEvent.click(closeBtn)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
