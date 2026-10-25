import { Check, ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge, Card, Image } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { formatDate } from '@/utils/date'
import { formatNumber } from '@/utils/formatters'
import type { ShopItemDto } from '@/types'
import { RARITY_TONES } from './cosmetic-utils'

interface ShopItemCardProps {
  item: ShopItemDto
  balance: number
  onBuy: (item: ShopItemDto) => void
}

export function ShopItemCard({ item, balance, onBuy }: Readonly<ShopItemCardProps>) {
  const { t } = useTranslation('gamification')
  const price = item.price ?? 0
  const canAfford = balance >= price
  const hasDiscount = item.original_price !== undefined && item.original_price > price

  function renderAction() {
    if (item.owned) {
      return (
        <Button variant="secondary" fullWidth disabled leftIcon={<Check size={16} />}>
          {t('shop.item.owned')}
        </Button>
      )
    }
    return (
      <Button
        variant="primary"
        fullWidth
        disabled={!canAfford}
        leftIcon={<ShoppingCart size={16} />}
        onClick={() => onBuy(item)}
        aria-label={`${t('shop.item.buy')} ${item.name ?? ''}`}
      >
        {canAfford ? t('shop.item.buy') : t('shop.item.notEnough')}
      </Button>
    )
  }

  return (
    <Card as="article" variant="compact" className="flex w-full flex-col gap-3">
      <Image src={item.asset_url} alt={item.name ?? ''} aspectRatio="1/1" fit="contain" radius="lg" />
      <header className="space-y-1">
        <Heading level={3} size="xs" truncate>
          {item.name}
        </Heading>
        {item.rarity ? (
          <Badge tone={RARITY_TONES[item.rarity]} size="xs">
            {t(`shop.rarity.${item.rarity}`)}
          </Badge>
        ) : null}
      </header>
      {item.description ? (
        <Text size="xs" tone="muted" clamp={2}>
          {item.description}
        </Text>
      ) : null}
      <footer className="mt-auto space-y-2">
        <p className="flex items-baseline gap-2">
          <strong className="text-lg font-bold text-fg-primary">{t('coins', { amount: formatNumber(price) })}</strong>
          {hasDiscount ? (
            <s className="text-xs text-fg-dim">
              {t('shop.item.originalPrice', { price: formatNumber(item.original_price ?? 0) })}
            </s>
          ) : null}
        </p>
        {item.available_until ? (
          <Text size="xs" tone="dim">
            {t('shop.item.availableUntil', { date: formatDate(item.available_until) })}
          </Text>
        ) : null}
        {renderAction()}
      </footer>
    </Card>
  )
}
