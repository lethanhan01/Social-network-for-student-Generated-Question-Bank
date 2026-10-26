import { Coins } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/feedback'
import { Text } from '@/components/ui/typography'
import { formatNumber } from '@/utils/formatters'

interface CoinBalanceProps {
  amount?: number
  loading?: boolean
}

export function CoinBalance({ amount, loading = false }: Readonly<CoinBalanceProps>) {
  const { t } = useTranslation('gamification')

  return (
    <section
      aria-label={t('shop.balance')}
      className="flex items-center gap-3 rounded-xl border border-line-subtle bg-surface-card px-4 py-2"
    >
      <Coins size={20} aria-hidden="true" className="text-status-warning-fg" />
      <Text as="span" size="xs" tone="muted">
        {t('shop.balance')}
      </Text>
      {loading ? (
        <Skeleton className="h-5 w-20" />
      ) : (
        <strong className="text-base font-bold text-fg-primary">
          {t('coins', { amount: formatNumber(amount ?? 0) })}
        </strong>
      )}
    </section>
  )
}
