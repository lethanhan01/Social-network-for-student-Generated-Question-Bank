import { Percent, Star, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { StatCard } from '@/components/ui/data-display'
import { formatNumber } from '@/utils/formatters'
import type { MyRankDto } from '@/types'

interface MyRankCardProps {
  myRank?: MyRankDto
  loading?: boolean
}

export function MyRankCard({ myRank, loading = false }: Readonly<MyRankCardProps>) {
  const { t } = useTranslation('gamification')
  const rank = myRank?.rank ?? 0
  const hasRank = rank > 0

  return (
    <section aria-label={t('leaderboard.myRank.title')} className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
      <StatCard
        icon={<Trophy size={20} />}
        tone="accent"
        label={t('leaderboard.myRank.rank')}
        value={hasRank ? `#${rank}` : t('leaderboard.myRank.unranked')}
        hint={
          myRank?.total_participants
            ? t('leaderboard.myRank.participants', { count: myRank.total_participants })
            : undefined
        }
        loading={loading}
      />
      <StatCard
        icon={<Star size={20} />}
        tone="warning"
        label={t('leaderboard.myRank.points')}
        value={formatNumber(myRank?.total_points ?? 0)}
        loading={loading}
      />
      <StatCard
        icon={<Percent size={20} />}
        tone="success"
        label={t('leaderboard.myRank.topLabel')}
        value={
          hasRank && myRank?.top_percent !== undefined
            ? t('leaderboard.myRank.top', { percent: myRank.top_percent })
            : t('leaderboard.myRank.unranked')
        }
        loading={loading}
      />
    </section>
  )
}
