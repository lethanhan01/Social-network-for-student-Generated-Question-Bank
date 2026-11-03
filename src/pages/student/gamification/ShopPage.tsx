import { Backpack, Store } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Page, PageHeader } from '@/components/ui/layout'
import { SegmentedControl, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation'
import {
  COSMETIC_TYPE_FILTERS,
  CoinBalance,
  InventoryPanel,
  ShopItemsPanel,
  type CosmeticTypeFilter,
} from '@/components/gamification'
import { useCosmeticShopQuery } from '@/hooks/queries/useCosmeticsQuery'
import { getApiError } from '@/lib/api-error'

type ShopTab = 'shop' | 'inventory'

function parseTab(value: string | null): ShopTab {
  return value === 'inventory' ? 'inventory' : 'shop'
}

function parseTypeFilter(value: string | null): CosmeticTypeFilter {
  return COSMETIC_TYPE_FILTERS.find((filter) => filter === value) ?? 'ALL'
}

export default function ShopPage() {
  const { t } = useTranslation('gamification')
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = parseTab(searchParams.get('tab'))
  const typeFilter = parseTypeFilter(searchParams.get('type'))
  const shopQuery = useCosmeticShopQuery()

  function updateParam(key: 'tab' | 'type', value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set(key, value)
        return next
      },
      { replace: true }
    )
  }

  const filterOptions = COSMETIC_TYPE_FILTERS.map((value) => ({ value, label: t(`shop.filter.${value}`) }))

  return (
    <Page>
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('shop.title')}
        description={t('shop.description')}
        actions={<CoinBalance amount={shopQuery.data?.user_points} loading={shopQuery.isLoading} />}
      />

      <Tabs value={tab} onValueChange={(value) => updateParam('tab', value)} className="space-y-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList aria-label={t('shop.tabs.label')}>
            <TabsTrigger value="shop" leftIcon={<Store size={16} />}>
              {t('shop.tabs.shop')}
            </TabsTrigger>
            <TabsTrigger value="inventory" leftIcon={<Backpack size={16} />}>
              {t('shop.tabs.inventory')}
            </TabsTrigger>
          </TabsList>
          <SegmentedControl
            options={filterOptions}
            value={typeFilter}
            onValueChange={(value) => updateParam('type', value)}
            size="sm"
          />
        </header>

        <TabsContent value="shop">
          <ShopItemsPanel
            items={shopQuery.data?.items ?? []}
            balance={shopQuery.data?.user_points ?? 0}
            typeFilter={typeFilter}
            loading={shopQuery.isLoading}
            error={shopQuery.isError ? getApiError(shopQuery.error, t('shop.loadError')) : null}
            onRetry={() => void shopQuery.refetch()}
          />
        </TabsContent>
        <TabsContent value="inventory">
          <InventoryPanel typeFilter={typeFilter} onGoShop={() => updateParam('tab', 'shop')} />
        </TabsContent>
      </Tabs>
    </Page>
  )
}
