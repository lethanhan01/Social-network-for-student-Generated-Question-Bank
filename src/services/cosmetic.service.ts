import api, { requestData, type GlobalResponse } from './api'
import type {
  CosmeticShopResponseDto,
  MyInventoryResponseDto,
  ShopItemDto,
  EquipCosmeticRequestDto,
  EquipCosmeticResponseDto,
  UnequipCosmeticRequestDto,
  UnequipCosmeticResponseDto,
} from '@/types'

export const cosmeticService = {
  async getCosmeticShop(
    params?: { cursor?: string; limit?: number },
    options?: { signal?: AbortSignal }
  ): Promise<CosmeticShopResponseDto> {
    return requestData<CosmeticShopResponseDto>(
      api.get<GlobalResponse<CosmeticShopResponseDto>>('/cosmetics/shop', {
        params,
        signal: options?.signal,
      })
    )
  },

  async getMyInventory(options?: { signal?: AbortSignal }): Promise<MyInventoryResponseDto> {
    return requestData<MyInventoryResponseDto>(
      api.get<GlobalResponse<MyInventoryResponseDto>>('/cosmetics/my-inventory', {
        signal: options?.signal,
      })
    )
  },

  async buyCosmetic(id: number): Promise<ShopItemDto> {
    return requestData<ShopItemDto>(
      api.post<GlobalResponse<ShopItemDto>>(`/cosmetics/${id}/buy`)
    )
  },

  async equipCosmetic(payload: EquipCosmeticRequestDto): Promise<EquipCosmeticResponseDto> {
    return requestData<EquipCosmeticResponseDto>(
      api.put<GlobalResponse<EquipCosmeticResponseDto>>('/cosmetics/equip', payload)
    )
  },

  async unequipCosmetic(payload: UnequipCosmeticRequestDto): Promise<UnequipCosmeticResponseDto> {
    return requestData<UnequipCosmeticResponseDto>(
      api.put<GlobalResponse<UnequipCosmeticResponseDto>>('/cosmetics/unequip', payload)
    )
  },
}
