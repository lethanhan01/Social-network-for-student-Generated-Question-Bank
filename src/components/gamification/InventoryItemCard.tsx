import { useTranslation } from 'react-i18next'
import { Badge, Card, Image } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { formatDate } from '@/utils/date'
import type { InventoryItemDto } from '@/types'
import { RARITY_TONES } from './cosmetic-utils'

interface InventoryItemCardProps {
  item: InventoryItemDto
  equipped: boolean
  pending?: boolean
  onToggleEquip: (item: InventoryItemDto, equip: boolean) => void
}

export function InventoryItemCard({ item, equipped, pending = false, onToggleEquip }: Readonly<InventoryItemCardProps>) {
  const { t } = useTranslation('gamification')

  return (
    <Card as="article" variant="compact" selected={equipped} className="flex w-full flex-col gap-3">
      <Image src={item.asset_url} alt={item.name ?? ''} aspectRatio="1/1" fit="contain" radius="lg" />
      <header className="space-y-1">
        <Heading level={3} size="xs" truncate>
          {item.name}
        </Heading>
        <p className="flex flex-wrap gap-1.5">
          {item.rarity ? (
            <Badge tone={RARITY_TONES[item.rarity]} size="xs">
              {t(`shop.rarity.${item.rarity}`)}
            </Badge>
          ) : null}
          {item.acquire_method ? (
            <Badge tone="neutral" emphasis="outline" size="xs">
              {t(`shop.acquire.${item.acquire_method}`)}
            </Badge>
          ) : null}
          {equipped ? (
            <Badge tone="success" emphasis="solid" size="xs">
              {t('shop.inventory.equipped')}
            </Badge>
          ) : null}
        </p>
      </header>
      {item.unlocked_at ? (
        <Text size="xs" tone="dim">
          {t('shop.inventory.acquiredAt', { date: formatDate(item.unlocked_at) })}
        </Text>
      ) : null}
      <footer className="mt-auto">
        <Button
          variant={equipped ? 'outline' : 'primary'}
          fullWidth
          loading={pending}
          onClick={() => onToggleEquip(item, !equipped)}
          aria-label={`${equipped ? t('shop.inventory.unequip') : t('shop.inventory.equip')} ${item.name ?? ''}`}
        >
          {equipped ? t('shop.inventory.unequip') : t('shop.inventory.equip')}
        </Button>
      </footer>
    </Card>
  )
}
