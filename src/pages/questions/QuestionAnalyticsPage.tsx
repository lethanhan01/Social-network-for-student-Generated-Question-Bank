import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, MessageSquare, Star, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { BackButton } from '@/components/ui/actions'
import { Badge, Card, StatCard } from '@/components/ui/data-display'
import { ProgressBar } from '@/components/ui/feedback'
import { Grid, Page, PageEmptyState, PageErrorState, PageHeader, PageSkeleton } from '@/components/ui/layout'
import { Heading, Text } from '@/components/ui/typography'
import { useQuestionRatingsQuery, useQuestionStatisticsQuery } from '@/hooks/queries'
import { getApiError } from '@/lib/api-error'
import { formatDateTime } from '@/utils/date'
import { formatNumber } from '@/utils/formatters'
import type { QuestionRatingsResponse, QuestionStatisticsResponse } from '@/types'

const RATING_KEYS = ['0', '1', '2', '3', '4'] as const
const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

interface DistributionCardProps {
  title: string
  keys: readonly string[]
  total: number
  renderRow: (key: string) => ReactNode
}

function DistributionCard({ title, keys, total, renderRow }: Readonly<DistributionCardProps>) {
  return (
    <Card as="section" variant="compact" aria-label={title} className="space-y-3">
      <Heading level={2} size="xs">
        {title}
      </Heading>
      <ul className="space-y-3">
        {keys.map((key) => (
          <li key={key}>{renderRow(key)}</li>
        ))}
      </ul>
      <Text size="xs" tone="dim">
        {formatNumber(total)}
      </Text>
    </Card>
  )
}
export default function QuestionAnalyticsPage() {
  const { t } = useTranslation('academic')
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const questionId = Number(id)
  const statsQuery = useQuestionStatisticsQuery(questionId)
  const ratingsQuery = useQuestionRatingsQuery(questionId)

  const stats: QuestionStatisticsResponse | undefined = statsQuery.data
  const ratings: QuestionRatingsResponse | undefined = ratingsQuery.data
  const optionDistribution = stats?.option_distribution ?? {}
  const ratingDistribution = stats?.rating_summary?.distribution ?? {}
  const totalAnswers = stats?.total_answer ?? 0
  const totalRatings = stats?.rating_summary?.total_ratings ?? 0

  function renderStats() {
    if (!Number.isFinite(questionId) || questionId <= 0) {
      return <PageEmptyState title={t('analytics.invalidQuestion')} />
    }
    if (statsQuery.isLoading) return <PageSkeleton rows={3} />
    if (statsQuery.isError || !stats) {
      return (
        <PageErrorState
          message={getApiError(statsQuery.error, t('analytics.loadError'))}
          onRetry={() => void statsQuery.refetch()}
        />
      )
    }
    return (
      <>
        <Grid cols={1} smCols={2} lgCols={4} gap={4} as="section" aria-label={t('analytics.summary')}>
          <StatCard icon={<Users size={20} />} label={t('analytics.totalAnswers')} value={formatNumber(totalAnswers)} />
          <StatCard
            icon={<CheckCircle2 size={20} />}
            tone="success"
            label={t('analytics.correctRate')}
            value={`${Math.round((stats.correct_rate ?? 0) * 100)}%`}
          />
          <StatCard
            icon={<Star size={20} />}
            tone="warning"
            label={t('analytics.avgRating')}
            value={(stats.rating_summary?.avg_rating ?? 0).toFixed(1)}
            hint={t('analytics.outOf')}
          />
          <StatCard icon={<MessageSquare size={20} />} tone="info" label={t('analytics.totalRatings')} value={formatNumber(totalRatings)} />
        </Grid>

        <Grid cols={1} lgCols={2} gap={4}>
          <DistributionCard
            title={t('analytics.optionDistribution')}
            keys={OPTION_KEYS}
            total={totalAnswers}
            renderRow={(key) => (
              <ProgressBar
                value={toNumber(optionDistribution[key])}
                max={Math.max(totalAnswers, 1)}
                tone="accent"
                label={t('analytics.optionLabel', { key })}
                valueFormatter={(value) => formatNumber(value)}
                showValue
              />
            )}
          />
          <DistributionCard
            title={t('analytics.ratingDistribution')}
            keys={RATING_KEYS}
            total={totalRatings}
            renderRow={(key) => (
              <ProgressBar
                value={toNumber(ratingDistribution[key])}
                max={Math.max(totalRatings, 1)}
                tone="warning"
                label={t('analytics.ratingLabel', { level: key })}
                valueFormatter={(value) => formatNumber(value)}
                showValue
              />
            )}
          />
        </Grid>
      </>
    )
  }

  function renderRatings() {
    if (ratingsQuery.isLoading) return <PageSkeleton rows={2} />
    if (ratingsQuery.isError) {
      return (
        <PageErrorState
          message={getApiError(ratingsQuery.error, t('analytics.ratingsLoadError'))}
          onRetry={() => void ratingsQuery.refetch()}
        />
      )
    }
    const items = ratings?.items ?? []
    if (items.length === 0) return <PageEmptyState title={t('analytics.noRatings')} />
    return (
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={`${item.user_id}-${item.created_at}`}>
            <Card as="article" variant="compact" className="space-y-2">
              <header className="flex flex-wrap items-center gap-2">
                <Badge tone="warning" size="xs" leftIcon={<Star size={12} />}>
                  {t('analytics.ratingValue', { rating: item.rating ?? 0 })}
                </Badge>
                {item.is_error ? (
                  <Badge tone="danger" size="xs" leftIcon={<AlertTriangle size={12} />}>
                    {t('analytics.errorFlag')}
                  </Badge>
                ) : null}
                {item.created_at ? (
                  <Text size="xs" tone="dim">
                    {formatDateTime(item.created_at)}
                  </Text>
                ) : null}
              </header>
              {item.comment ? (
                <Text as="p" size="sm" tone="muted" className="whitespace-pre-wrap">
                  {item.comment}
                </Text>
              ) : null}
            </Card>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <Page>
      <BackButton label={t('common.back')} onClick={() => navigate(-1)} />
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('analytics.title')}
        description={t('analytics.description', { id: Number.isFinite(questionId) ? questionId : '' })}
      />
      {renderStats()}
      <section aria-label={t('analytics.ratingsTitle')} className="space-y-3">
        <Heading level={2} size="sm">
          {t('analytics.ratingsTitle')}
        </Heading>
        {renderRatings()}
      </section>
    </Page>
  )
}
