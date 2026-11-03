import { useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AcademicLayout } from '@/components/academic/AcademicLayout'
import { AcademicFeedback } from '@/components/academic/AcademicFeedback'
import { Card } from '@/components/ui/data-display/Card'
import { ButtonLink } from '@/components/ui/actions/Button'
import { Button } from '@/components/ui/actions/Button'
import { useQuestionStatisticsQuery, useQuestionRatingsQuery, useSessionQuestionsQuery } from '@/hooks/queries/useAcademicQuery'
import { positiveId } from '@/types/academic.types'
import { formatDateTime } from '@/utils/date'

export default function QuestionAnalyticsPage() {
  const { t } = useTranslation('academic')
  const { id: rawId } = useParams()
  const id = positiveId(rawId)
  const [params] = useSearchParams()
  const sessionId = positiveId(params.get('sessionId'))
  const rawIndex = Number(params.get('question'))
  const questionIndex = Number.isSafeInteger(rawIndex) && rawIndex >= 0 ? rawIndex : 0
  const stats = useQuestionStatisticsQuery(id)
  const ratings = useQuestionRatingsQuery(id)
  const session = useSessionQuestionsQuery(sessionId)
  const question = session.data?.questions?.find((item) => item.question_id === id)
  const data = stats.data
  const ratingItems = ratings.data?.pages.flatMap((page) => page.items ?? []) ?? []
  return (
    <AcademicLayout title={t('analytics.title')} subtitle={t('analytics.subtitle', { id: id ?? '' })}>
      <ButtonLink to={sessionId ? `/practice/${sessionId}?question=${questionIndex}` : '/practice'} variant="ghost">{t('practice.title')}</ButtonLink>
      {question ? <Card as="article" className="rounded-2xl"><h2 className="font-semibold">{question.content}</h2></Card> : null}
      {sessionId && session.isError ? <AcademicFeedback error={session.error} onRetry={session.refetch} /> : null}
      {!id ? <AcademicFeedback empty={t('practice.invalid')} /> : stats.isPending ? <AcademicFeedback pending /> : stats.isError ? (
        <AcademicFeedback error={stats.error} onRetry={stats.refetch} />
      ) : <>
        <section className="grid gap-4 sm:grid-cols-2">
          <Card as="section"><p>{t('analytics.answers')}</p><strong className="text-3xl">{data?.total_answer ?? 0}</strong></Card>
          <Card as="section"><p>{t('analytics.correctRate')}</p><strong className="text-3xl">{Math.round((data?.correct_rate ?? 0) * 100)}%</strong></Card>
          <Card as="section"><p>{t('analytics.average')}</p><strong className="text-3xl">{data?.rating_summary?.avg_rating ?? '—'}</strong></Card>
          <Card as="section"><p>{t('analytics.ratings')}</p><strong className="text-3xl">{data?.rating_summary?.total_ratings ?? 0}</strong></Card>
        </section>
        <Card as="section" className="space-y-3 rounded-2xl">
          <h2 className="font-bold">{t('analytics.distribution')}</h2>
          {Object.entries(data?.option_distribution ?? {}).map(([key, value]) => <p key={key} className="flex justify-between border-b border-line-subtle py-2">
            <strong>{key}</strong><output>{Number.isFinite(Number(value)) ? Number(value) : 0}</output>
          </p>)}
        </Card>
        <Card as="section" className="space-y-3 rounded-2xl">
          <h2 className="font-bold">{t('analytics.ratings')}</h2>
          {([0, 1, 2, 3, 4] as const).map((score) => {
            const count = Number(data?.rating_summary?.distribution?.[String(score)] ?? 0)
            return <section key={score} className="space-y-1">
              <p className="flex justify-between text-sm"><strong>{t(`rating.${score}`)}</strong><output>{Number.isFinite(count) ? count : 0}</output></p>
              <progress className="h-2 w-full accent-action-accent" aria-label={t(`rating.${score}`)}
                value={Number.isFinite(count) ? count : 0} max={Math.max(1, data?.rating_summary?.total_ratings ?? 0)} />
            </section>
          })}
        </Card>
      </>}
      {id ? <Card as="section" className="space-y-4 rounded-2xl">
        <h2 className="font-bold">{t('analytics.community')}</h2>
        {ratings.isPending ? <AcademicFeedback pending /> : ratings.isError ? <AcademicFeedback error={ratings.error} onRetry={ratings.refetch} /> : (
          ratingItems.length === 0 ? <p className="text-text-muted">{t('analytics.noRatings')}</p> : ratingItems.map((item, index) => (
            <article key={`${item.user_id}-${index}`} className="space-y-2 rounded-xl bg-surface-sunken p-4">
              <header className="flex flex-wrap justify-between gap-2 text-sm"><strong>{t('rating.value', { score: item.rating ?? 0 })}</strong><time>{formatDateTime(item.created_at)}</time></header>
              {item.is_error ? <p className="text-sm text-status-warning-fg">{t('rating.report')}</p> : null}
              <p className="whitespace-pre-wrap text-sm">{item.comment}</p>
            </article>
          ))
        )}
        {ratings.hasNextPage ? <Button variant="outline" loading={ratings.isFetchingNextPage}
          onClick={() => { void ratings.fetchNextPage() }}>{t('loadMore')}</Button> : null}
      </Card> : null}
    </AcademicLayout>
  )
}
