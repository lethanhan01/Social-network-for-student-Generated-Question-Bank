import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { TopbarSearch } from './TopbarSearch'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('TopbarSearch', () => {
  it('renders search input with placeholder and navigates on submit', () => {
    mockNavigate.mockClear()

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <TopbarSearch />
      </MemoryRouter>
    )

    const searchInput = screen.getByRole('searchbox', { name: /tìm kiếm trên sqb hust/i })
    expect(searchInput).toBeInTheDocument()

    fireEvent.change(searchInput, { target: { value: 'Giải tích 1' } })
    fireEvent.submit(searchInput.closest('form')!)

    expect(mockNavigate).toHaveBeenCalledWith('/search?q=Gi%E1%BA%A3i%20t%C3%ADch%201')
  })

  it('navigates to /search when submitted with empty string', () => {
    mockNavigate.mockClear()

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <TopbarSearch />
      </MemoryRouter>
    )

    const form = screen.getByRole('form', { name: /tìm kiếm/i })
    fireEvent.submit(form)

    expect(mockNavigate).toHaveBeenCalledWith('/search')
  })
})
