import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cosmeticService } from '@/services/cosmetic.service'
import { queryKeys } from '@/lib/query-keys'

export function useCosmeticShopQuery() {
  return useQuery({
    queryKey: queryKeys.cosmetics.shop(),
    queryFn: ({ signal }) => cosmeticService.getCosmeticShop(undefined, { signal }),
  })
}

export function useMyInventoryQuery() {
  return useQuery({
    queryKey: queryKeys.cosmetics.inventory(),
    queryFn: ({ signal }) => cosmeticService.getMyInventory({ signal }),
  })
}

export function useBuyCosmeticMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cosmeticId: number) => cosmeticService.buyCosmetic(cosmeticId),
    onSuccess: () => {
      // Mua hàng làm thay đổi số dư xu, trạng thái owned và túi đồ
      void queryClient.invalidateQueries({ queryKey: queryKeys.cosmetics.all })
    },
  })
}

export function useToggleEquipCosmeticMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ cosmeticId, equip }: { cosmeticId: number; equip: boolean }) =>
      equip
        ? cosmeticService.equipCosmetic({ cosmetic_id: cosmeticId })
        : cosmeticService.unequipCosmetic({ cosmetic_id: cosmeticId }),
    onSuccess: () => {
      // Khung avatar hiển thị trên hồ sơ và bảng xếp hạng cũng thay đổi theo
      void queryClient.invalidateQueries({ queryKey: queryKeys.cosmetics.inventory() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.gamification.all })
    },
  })
}
