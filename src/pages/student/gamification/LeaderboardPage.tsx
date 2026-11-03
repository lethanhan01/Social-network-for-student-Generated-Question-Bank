import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Page, PageHeader } from '@/components/ui/layout'
import { SegmentedControl } from '@/components/ui/navigation'
import { Heading } from '@/components/ui/typography'
import { CheckInCard, LeaderboardTable, MyRankCard } from '@/components/gamification'
import { useLeaderboardQuery, type LeaderboardPeriod } from '@/hooks/queries/useGamificationQuery'
import { getApiError } from '@/lib/api-error'

const PERIODS: readonly LeaderboardPeriod[] = ['WEEKLY', 'MONTHLY', 'ALL_TIME']

function parsePeriod(value: string | null): LeaderboardPeriod {
  return PERIODS.find((period) => period === value) ?? 'WEEKLY'
}

export default function LeaderboardPage() {
  const { t } = useTranslation('gamification')
  const [searchParams, setSearchParams] = useSearchParams()
  const period = parsePeriod(searchParams.get('period'))
  const leaderboardQuery = useLeaderboardQuery(period)

  function handlePeriodChange(value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('period', value)
        return next
      },
      { replace: true }
    )
  }

  const periodOptions = PERIODS.map((value) => ({ value, label: t(`leaderboard.period.${value}`) }))

  return (
    <Page>
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('leaderboard.title')}
        description={t('leaderboard.description')}
      />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <aside className="space-y-4">
          <CheckInCard />
          <MyRankCard myRank={leaderboardQuery.data?.my_rank} loading={leaderboardQuery.isLoading} />
        </aside>

        <section aria-labelledby="leaderboard-heading" className="space-y-4 lg:col-span-2">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Heading level={2} size="sm" id="leaderboard-heading">
              {t('leaderboard.table.title')}
            </Heading>
            <SegmentedControl options={periodOptions} value={period} onValueChange={handlePeriodChange} size="sm" />
          </header>

          <LeaderboardTable
            entries={leaderboardQuery.data?.entries ?? []}
            loading={leaderboardQuery.isLoading}
            error={leaderboardQuery.isError ? getApiError(leaderboardQuery.error, t('leaderboard.table.error')) : null}
            onRetry={() => void leaderboardQuery.refetch()}
          />
        </section>
      </section>
    </Page>
  )
}
