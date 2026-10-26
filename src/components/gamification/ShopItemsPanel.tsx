import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageEmptyState, PageErrorState, PageSkeleton } from '@/components/ui/layout'
import { ConfirmDialog } from '@/components/ui/overlay'
import { useBuyCosmeticMutation } from '@/hooks/queries/useCosmeticsQuery'
import { toast } from '@/lib/toast'
import { getApiError } from '@/lib/api-error'
import { formatNumber } from '@/utils/formatters'
import type { ShopItemDto } from '@/types'
import { ShopItemCard } from './ShopItemCard'
import { matchesTypeFilter, type CosmeticTypeFilter } from './cosmetic-utils'

interface ShopItemsPanelProps {
  items: ShopItemDto[]
  balance: number
  typeFilter: CosmeticTypeFilter
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

export function ShopItemsPanel({ items, balance, typeFilter, loading, error, onRetry }: Readonly<ShopItemsPanelProps>) {
  const { t } = useTranslation('gamification')
  const [pendingItem, setPendingItem] = useState<ShopItemDto | null>(null)
  const buyMutation = useBuyCosmeticMutation()

  const visibleItems = items.filter((item) => matchesTypeFilter(item.type, typeFilter))

  function handleConfirmBuy() {
    if (!pendingItem?.cosmetic_id) return
    const itemName = pendingItem.name ?? ''
    buyMutation.mutate(pendingItem.cosmetic_id, {
      onSuccess: () => {
        toast.success(t('shop.buySuccess', { name: itemName }), {
          description: t('shop.buySuccessDescription'),
        })
        setPendingItem(null)
      },
      onError: (err) => {
        toast.error(t('shop.buyError'), { description: getApiError(err) })
      },
    })
  }

  if (loading) {
    return <PageSkeleton rows={3} />
  }

  if (error) {
    return <PageErrorState message={error} onRetry={onRetry} />
  }

  if (visibleItems.length === 0) {
    return <PageEmptyState title={t('shop.empty')} description={t('shop.emptyDescription')} />
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleItems.map((item) => (
          <li key={item.cosmetic_id ?? item.name} className="flex">
            <ShopItemCard item={item} balance={balance} onBuy={setPendingItem} />
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={pendingItem !== null}
        onClose={() => setPendingItem(null)}
        onConfirm={handleConfirmBuy}
        title={t('shop.confirm.title')}
        description={t('shop.confirm.description', {
          name: pendingItem?.name ?? '',
          price: formatNumber(pendingItem?.price ?? 0),
        })}
        confirmLabel={t('shop.confirm.action')}
        loading={buyMutation.isPending}
      />
    </>
  )
}
