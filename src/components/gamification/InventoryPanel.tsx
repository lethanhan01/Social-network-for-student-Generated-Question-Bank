import { Store } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/actions'
import { Card } from '@/components/ui/data-display'
import { ProgressBar } from '@/components/ui/feedback'
import { PageEmptyState, PageErrorState, PageSkeleton } from '@/components/ui/layout'
import { Heading, Text } from '@/components/ui/typography'
import { useMyInventoryQuery, useToggleEquipCosmeticMutation } from '@/hooks/queries/useCosmeticsQuery'
import { toast } from '@/lib/toast'
import { getApiError } from '@/lib/api-error'
import type { InventoryItemDto } from '@/types'
import { InventoryItemCard } from './InventoryItemCard'
import { getEquippedIds, matchesTypeFilter, type CosmeticTypeFilter } from './cosmetic-utils'

interface InventoryPanelProps {
  typeFilter: CosmeticTypeFilter
  onGoShop: () => void
}

export function InventoryPanel({ typeFilter, onGoShop }: Readonly<InventoryPanelProps>) {
  const { t } = useTranslation('gamification')
  const inventoryQuery = useMyInventoryQuery()
  const toggleEquipMutation = useToggleEquipCosmeticMutation()

  function handleToggleEquip(item: InventoryItemDto, equip: boolean) {
    if (!item.cosmetic_id) return
    const itemName = item.name ?? ''
    toggleEquipMutation.mutate(
      { cosmeticId: item.cosmetic_id, equip },
      {
        onSuccess: () => {
          toast.success(
            equip
              ? t('shop.inventory.equipSuccess', { name: itemName })
              : t('shop.inventory.unequipSuccess', { name: itemName })
          )
        },
        onError: (err) => {
          toast.error(t('shop.inventory.equipError'), { description: getApiError(err) })
        },
      }
    )
  }

  if (inventoryQuery.isLoading) {
    return <PageSkeleton rows={3} />
  }

  if (inventoryQuery.isError) {
    return (
      <PageErrorState
        message={getApiError(inventoryQuery.error, t('shop.inventory.loadError'))}
        onRetry={() => void inventoryQuery.refetch()}
      />
    )
  }

  const summary = inventoryQuery.data?.summary
  const equippedIds = getEquippedIds(inventoryQuery.data?.currently_equipped)
  const visibleItems = (inventoryQuery.data?.inventory ?? []).filter((item) =>
    matchesTypeFilter(item.type, typeFilter)
  )
  const pendingId = toggleEquipMutation.isPending ? toggleEquipMutation.variables?.cosmeticId : undefined

  return (
    <section className="space-y-4" aria-labelledby="inventory-summary-heading">
      <Card as="section" variant="compact" className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-center">
        <hgroup>
          <Heading level={2} size="xs" id="inventory-summary-heading">
            {t('shop.inventory.summaryTitle')}
          </Heading>
          <Text size="sm" tone="muted">
            {t('shop.inventory.unlocked')}: <strong className="text-fg-primary">{summary?.total_unlocked ?? 0}</strong>
          </Text>
        </hgroup>
        <ProgressBar
          className="sm:col-span-2"
          value={summary?.collection_completion_percent ?? 0}
          max={100}
          tone="accent"
          label={t('shop.inventory.completion')}
          showValue
        />
      </Card>

      {visibleItems.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleItems.map((item) => (
            <li key={item.cosmetic_id ?? item.name} className="flex">
              <InventoryItemCard
                item={item}
                equipped={item.cosmetic_id !== undefined && equippedIds.has(item.cosmetic_id)}
                pending={pendingId !== undefined && pendingId === item.cosmetic_id}
                onToggleEquip={handleToggleEquip}
              />
            </li>
          ))}
        </ul>
      ) : (
        <PageEmptyState
          title={t('shop.inventory.empty')}
          description={t('shop.inventory.emptyDescription')}
          action={
            <Button variant="primary" leftIcon={<Store size={16} />} onClick={onGoShop}>
              {t('shop.inventory.goShop')}
            </Button>
          }
        />
      )}
    </section>
  )
}
