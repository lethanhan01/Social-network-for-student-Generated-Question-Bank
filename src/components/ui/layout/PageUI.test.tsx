import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/lib/i18n'
import { PageErrorState, Page } from './PageUI'

describe('PageErrorState', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('vi')
  })

  it('preserves message and retry behavior with the responsive layout classes', () => {
    const onRetry = vi.fn()
    const { container } = render(<PageErrorState message="Không thể tải dữ liệu" onRetry={onRetry} />)

    expect(screen.getByText('Không thể tải dữ liệu')).toBeVisible()
    expect(container.firstElementChild).toHaveClass('flex-col', 'sm:flex-row')

    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})

describe('Page Primitive Layout', () => {
  it('renders default container with max-w-7xl and mx-auto', () => {
    const { container } = render(
      <Page>
        <p>Nội dung trang</p>
      </Page>
    )
    expect(container.firstElementChild).toHaveClass('max-w-7xl', 'mx-auto', 'w-full')
  })

  it('renders 2xl container when maxWidth="2xl" is passed', () => {
    const { container } = render(
      <Page maxWidth="2xl">
        <p>Bảng tin mở rộng</p>
      </Page>
    )
    expect(container.firstElementChild).toHaveClass('max-w-screen-2xl', 'mx-auto', 'w-full')
    expect(container.firstElementChild).not.toHaveClass('max-w-7xl')
  })

  it('renders full container when maxWidth="full" is passed', () => {
    const { container } = render(
      <Page maxWidth="full">
        <p>Toàn màn hình</p>
      </Page>
    )
    expect(container.firstElementChild).toHaveClass('max-w-full', 'mx-auto', 'w-full')
  })
})
