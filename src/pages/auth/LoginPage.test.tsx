import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from './LoginPage'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/authStore'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
  },
}))

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().clearAuth()
  })

  it('renders login form with default credentials', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    expect(screen.getByRole('heading', { name: /SQB HUST/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Email SIS HUST/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mật khẩu/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Đăng nhập hệ thống/i })).toBeInTheDocument()
  })

  it('submits form and navigates to /feed on student login success', async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({
      user_id: 235,
      username: 'an.lt235631@sis.hust.edu.vn',
      role: 'STUDENT',
      access_token: 'fake-jwt-token',
      verified: true,
      profile_completed: true,
    })

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const submitBtn = screen.getByRole('button', { name: /Đăng nhập hệ thống/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'an.lt235631@sis.hust.edu.vn',
          password: '20235631',
        })
      )
      expect(mockNavigate).toHaveBeenCalledWith('/feed', { replace: true })
    })
  })

  it('navigates to /admin/users on admin login success', async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({
      user_id: 1,
      username: 'admin@sis.hust.edu.vn',
      role: 'ADMIN',
      access_token: 'fake-admin-token',
      verified: true,
      profile_completed: true,
    })

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const submitBtn = screen.getByRole('button', { name: /Đăng nhập hệ thống/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/users', { replace: true })
    })
  })
})
