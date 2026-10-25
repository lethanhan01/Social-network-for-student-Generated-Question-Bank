import type { Tone } from '@/lib/variants'

export type CosmeticRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
export type CosmeticType = 'AVATAR_FRAME' | 'CHAT_BUBBLE'
export type CosmeticTypeFilter = 'ALL' | CosmeticType

export const COSMETIC_TYPE_FILTERS: readonly CosmeticTypeFilter[] = ['ALL', 'AVATAR_FRAME', 'CHAT_BUBBLE']

export const RARITY_TONES: Record<CosmeticRarity, Tone> = {
  COMMON: 'neutral',
  RARE: 'info',
  EPIC: 'accent',
  LEGENDARY: 'warning',
}

export function matchesTypeFilter(type: CosmeticType | undefined, filter: CosmeticTypeFilter): boolean {
  return filter === 'ALL' || type === filter
}

/**
 * `currently_equipped` là map slot -> vật phẩm; trích ra tập cosmetic_id đang được trang bị.
 */
export function getEquippedIds(currentlyEquipped?: Record<string, unknown>): Set<number> {
  const ids = Object.values(currentlyEquipped ?? {}).flatMap((slotItem) => {
    if (slotItem && typeof slotItem === 'object' && 'cosmetic_id' in slotItem) {
      const id = (slotItem as { cosmetic_id?: unknown }).cosmetic_id
      return typeof id === 'number' ? [id] : []
    }
    return []
  })
  return new Set(ids)
}
