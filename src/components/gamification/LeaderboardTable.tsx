import { Medal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Avatar, Badge, ResponsiveTable, type ResponsiveColumnDef } from '@/components/ui/data-display'
import { Text } from '@/components/ui/typography'
import type { Tone } from '@/lib/variants'
import { formatNumber } from '@/utils/formatters'
import type { LeaderboardEntryDto } from '@/types'

const PODIUM_TONES: Record<number, Tone> = { 1: 'warning', 2: 'neutral', 3: 'accent' }

interface LeaderboardTableProps {
  entries: LeaderboardEntryDto[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

export function LeaderboardTable({ entries, loading, error, onRetry }: Readonly<LeaderboardTableProps>) {
  const { t } = useTranslation('gamification')

  const columns: ResponsiveColumnDef<LeaderboardEntryDto>[] = [
    {
      key: 'rank',
      header: t('leaderboard.table.rank'),
      className: 'w-20',
      render: (entry) => {
        const rank = entry.rank ?? 0
        const podiumTone = PODIUM_TONES[rank]
        return podiumTone ? (
          <Badge tone={podiumTone} emphasis="solid" size="sm" leftIcon={<Medal size={12} />}>
            {rank}
          </Badge>
        ) : (
          <strong className="font-semibold text-fg-secondary">{rank}</strong>
        )
      },
    },
    {
      key: 'user',
      header: t('leaderboard.table.user'),
      render: (entry) => (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Flex row căn Avatar với tên trong ô bảng] */
        <div className="flex items-center gap-3">
          <Avatar src={entry.avatar_url} name={entry.full_name} size="sm" />
          <Text as="span" size="sm" weight={entry.is_current_user ? 'bold' : 'medium'} truncate>
            {entry.full_name}
          </Text>
          {entry.is_current_user ? (
            <Badge tone="accent" size="xs">
              {t('leaderboard.table.you')}
            </Badge>
          ) : null}
        </div>
      ),
    },
    {
      key: 'user_code',
      header: t('leaderboard.table.code'),
      render: (entry) => (
        <Text as="span" size="sm" tone="muted">
          {entry.user_code ?? '—'}
        </Text>
      ),
    },
    {
      key: 'total_points',
      header: t('leaderboard.table.points'),
      align: 'right',
      render: (entry) => (
        <strong className="font-bold text-fg-primary">{formatNumber(entry.total_points ?? 0)}</strong>
      ),
    },
  ]

  return (
    <ResponsiveTable
      columns={columns}
      data={entries}
      keyExtractor={(entry, index) => entry.user_id ?? `rank-${entry.rank ?? index}`}
      loading={loading}
      error={error}
      onRetry={onRetry}
      emptyTitle={t('leaderboard.table.empty')}
      emptyDescription={t('leaderboard.table.emptyDescription')}
    />
  )
}
