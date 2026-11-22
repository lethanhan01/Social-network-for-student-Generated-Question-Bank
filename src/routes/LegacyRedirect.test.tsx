import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { LegacyRedirect } from './LegacyRedirect'

function CurrentLocation() {
  const { pathname, search } = useLocation()
  return <output>{`${pathname}${search}`}</output>
}

describe('LegacyRedirect', () => {
  it('redirects static legacy paths and preserves query string', () => {
    render(
      <MemoryRouter initialEntries={['/practice?subjectId=3']}>
        <Routes>
          <Route path="/practice" element={<LegacyRedirect to="/student/practice" />} />
          <Route path="/student/*" element={<CurrentLocation />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('status')).toHaveTextContent('/student/practice?subjectId=3')
  })

  it('interpolates route params and preserves query string', () => {
    render(
      <MemoryRouter initialEntries={['/questions/42/analytics?sessionId=7&question=2']}>
        <Routes>
          <Route
            path="/questions/:id/analytics"
            element={<LegacyRedirect to="/student/questions/:id/analytics" />}
          />
          <Route path="/student/*" element={<CurrentLocation />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      '/student/questions/42/analytics?sessionId=7&question=2'
    )
  })
})
