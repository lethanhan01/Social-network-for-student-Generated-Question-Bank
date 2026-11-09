import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import ShopPage from './ShopPage'
import { cosmeticService } from '@/services/cosmetic.service'

vi.mock('@/services/cosmetic.service', () => ({
  cosmeticService: {
    getCosmeticShop: vi.fn(),
    getMyInventory: vi.fn(),
    buyCosmetic: vi.fn(),
    equipCosmetic: vi.fn(),
    unequipCosmetic: vi.fn(),
  },
}))

const mockedService = vi.mocked(cosmeticService)

function renderPage(initialEntry = '/shop') {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ShopPage />
    </MemoryRouter>
  )
}

describe('ShopPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedService.getCosmeticShop.mockResolvedValue({
      user_points: 150,
      items: [
        { cosmetic_id: 1, name: 'Khung Bách Khoa', type: 'AVATAR_FRAME', rarity: 'RARE', price: 100 },
        { cosmetic_id: 2, name: 'Bong bóng Rồng', type: 'CHAT_BUBBLE', rarity: 'LEGENDARY', price: 500 },
        { cosmetic_id: 3, name: 'Khung Tân Sinh Viên', type: 'AVATAR_FRAME', rarity: 'COMMON', price: 0, owned: true },
      ],
    })
    mockedService.getMyInventory.mockResolvedValue({
      summary: { total_unlocked: 1, collection_completion_percent: 10 },
      currently_equipped: { AVATAR_FRAME: { cosmetic_id: 3, name: 'Khung Tân Sinh Viên' } },
      inventory: [{ cosmetic_id: 3, name: 'Khung Tân Sinh Viên', type: 'AVATAR_FRAME', rarity: 'COMMON' }],
    })
  })

  it('renders shop items with buy state based on balance and ownership', async () => {
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: /Cửa hàng Vật phẩm & Túi đồ/i })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /Mua Khung Bách Khoa/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /Mua Bong bóng Rồng/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Đã sở hữu/i })).toBeDisabled()
  })

  it('filters items by type from the URL', async () => {
    renderPage('/shop?type=CHAT_BUBBLE')

    expect(await screen.findByText('Bong bóng Rồng')).toBeInTheDocument()
    expect(screen.queryByText('Khung Bách Khoa')).not.toBeInTheDocument()
  })

  it('confirms before buying an item', async () => {
    mockedService.buyCosmetic.mockResolvedValue({ cosmetic_id: 1 })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: /Mua Khung Bách Khoa/i }))
    fireEvent.click(await screen.findByRole('button', { name: /Mua ngay/i }))

    await waitFor(() => expect(mockedService.buyCosmetic).toHaveBeenCalledWith(1))
  })

  it('shows equipped inventory items on the inventory tab', async () => {
    renderPage('/shop?tab=inventory')

    expect(await screen.findByRole('button', { name: /Tháo Khung Tân Sinh Viên/i })).toBeInTheDocument()
    expect(screen.getByText('Đang trang bị')).toBeInTheDocument()
  })
})
