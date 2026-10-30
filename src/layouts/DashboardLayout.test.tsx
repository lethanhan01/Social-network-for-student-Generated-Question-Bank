import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import DashboardLayout from './DashboardLayout'

describe('DashboardLayout — Topbar & Sidebar Non-Overlapping Architecture', () => {
  function renderLayout() {
    return render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<h1>Trang tổng quan</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
  }

  it('positions Topbar at top-0 (h-16) with solid bg-surface-card and Sidebar starting strictly below at top-16', () => {
    renderLayout()

    const topbar = screen.getByRole('banner')
    const sidebar = screen.getByRole('complementary', { name: /thanh điều hướng chính/i })

    expect(topbar).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'h-16', 'bg-surface-card')
    expect(sidebar).toHaveClass('fixed', 'top-16', 'bottom-0', 'left-0', 'bg-surface-card')
    expect(sidebar).not.toHaveClass('top-0')
  })

  it('expands Sidebar on desktop hover while remaining strictly below Topbar (top-16)', () => {
    renderLayout()

    const sidebar = screen.getByRole('complementary', { name: /thanh điều hướng chính/i })
    expect(sidebar).toHaveClass('w-18')
    expect(sidebar).not.toHaveClass('is-expanded')

    fireEvent.mouseEnter(sidebar)
    expect(sidebar).toHaveClass('w-64', 'is-expanded', 'top-16')
    expect(sidebar).not.toHaveClass('top-0')
  })

  it('toggles mobile Sidebar drawer below Topbar via Topbar hamburger button', () => {
    renderLayout()

    const sidebar = screen.getByRole('complementary', { name: /thanh điều hướng chính/i })
    const toggleBtn = screen.getByRole('button', { name: /mở menu/i })

    expect(sidebar).toHaveClass('-translate-x-full')

    fireEvent.click(toggleBtn)
    expect(sidebar).toHaveClass('translate-x-0', 'is-mobile-open', 'top-16')
    expect(screen.getByRole('button', { name: /đóng menu/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
  })
})

