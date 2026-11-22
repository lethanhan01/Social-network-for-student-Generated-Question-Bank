import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Heading, Text } from '@/components/ui/typography'
import { Card, Badge } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { Select } from '@/components/ui/forms'
import { AcademicFeedback } from '@/components/academic/AcademicFeedback'
import { useSubjectsQuery } from '@/hooks/queries/useCourseQuery'
import { useInfinitePendingSessionsQuery } from '@/hooks/queries/useReviewQuery'
import { positiveId } from '@/types/academic.types'
import { formatDateTime } from '@/utils/date'
import { cn } from '@/utils/cn'
import { ReviewSessionPanel } from './reviews/ReviewSessionPanel'

export default function TeacherReviewsPage() {
  const { t } = useTranslation('academic')
  const [params, setParams] = useSearchParams()
  const subjectId = positiveId(params.get('subjectId'))
  const selectedSessionId = positiveId(params.get('session'))

  const subjectsQuery = useSubjectsQuery()
  const sessionsQuery = useInfinitePendingSessionsQuery(subjectId)
  const sessions = sessionsQuery.data?.pages.flatMap((page) => page.items ?? []) ?? []
  const selectedSummary = sessions.find((item) => item.session_id === selectedSessionId)

  const subjectOptions = [
    { value: '', label: t('teacher.reviews.allSubjects') },
    ...(subjectsQuery.data ?? [])
      .filter((item) => item.subject_id != null)
      .map((item) => ({
        value: String(item.subject_id),
        label: `${item.code ?? ''} · ${item.name ?? ''}`.trim(),
      })),
  ]

  function updateParam(key: string, value?: string) {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }

  let sessionsContent: ReactNode
  if (sessionsQuery.isPending) {
    sessionsContent = <AcademicFeedback pending />
  } else if (sessionsQuery.isError) {
    sessionsContent = <AcademicFeedback error={sessionsQuery.error} onRetry={sessionsQuery.refetch} />
  } else if (sessions.length === 0) {
    sessionsContent = <AcademicFeedback empty={t('teacher.reviews.emptySessions')} />
  } else {
    sessionsContent = (
      <section className="space-y-2.5">
        {sessions.map((item) => {
          const isSelected = item.session_id === selectedSessionId
          return (
            <Card
              key={item.session_id}
              as="article"
              className={cn(
                'p-4 rounded-2xl border shadow-card space-y-2 transition-colors',
                isSelected ? 'bg-action-accent-soft border-action-accent' : 'bg-surface-card border-line-subtle'
              )}
            >
              <header className="flex items-center justify-between gap-2">
                {item.topic ? <Badge tone="accent" emphasis="subtle" size="sm">{item.topic}</Badge> : null}
                <Badge tone="warning" emphasis="subtle" size="sm">
                  {t(`status.${item.status ?? 'PENDING'}`, { defaultValue: item.status ?? 'PENDING' })}
                </Badge>
              </header>

              <p className="text-sm font-bold text-fg-primary line-clamp-2">
                {item.title || t('teacher.reviews.sessionHeading', { id: item.session_id ?? 0 })}
              </p>

              <Text size="xs" tone="muted">
                {[item.author?.full_name, item.created_at ? formatDateTime(item.created_at) : null]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>

              <Button
                variant={isSelected ? 'primary' : 'secondary'}
                size="sm"
                className="w-full min-h-11 text-xs"
                aria-pressed={isSelected}
                onClick={() => updateParam('session', String(item.session_id ?? ''))}
              >
                {t('common.details')}
              </Button>
            </Card>
          )
        })}

        {sessionsQuery.hasNextPage ? (
          <Button
            variant="outline"
            className="w-full min-h-11"
            loading={sessionsQuery.isFetchingNextPage}
            onClick={() => { void sessionsQuery.fetchNextPage() }}
          >
            {t('loadMore')}
          </Button>
        ) : null}
      </section>
    )
  }

  return (
    <section className="max-w-7xl mx-auto space-y-6">
      <header className="space-y-1 pb-2 border-b border-line-subtle">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title icon and heading row] */}
        <div className="flex items-center gap-2">
          <CheckSquare className="text-action-accent" size={26} />
          <Heading level={1} className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg-primary">
            {t('teacher.reviews.title')}
          </Heading>
        </div>
        <Text size="sm" tone="muted">
          {t('teacher.reviews.subtitle')}
        </Text>
      </header>

      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Master-detail two-column layout wrapper] */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside
          aria-label={t('teacher.reviews.sessionListAria')}
          className={cn('lg:col-span-4 space-y-3', selectedSessionId ? 'hidden lg:block' : 'block')}
        >
          <Select
            ariaLabel={t('teacher.reviews.subjectFilterAria')}
            value={subjectId ? String(subjectId) : ''}
            placeholder={t('teacher.reviews.allSubjects')}
            options={subjectOptions}
            onValueChange={(value) => updateParam('subjectId', value)}
          />

          {sessionsContent}
        </aside>

        <section className={cn('lg:col-span-8', selectedSessionId ? 'block' : 'hidden lg:block')}>
          {selectedSessionId ? (
            <ReviewSessionPanel
              key={selectedSessionId}
              sessionId={selectedSessionId}
              summary={selectedSummary}
              onBack={() => updateParam('session')}
              onCompleted={() => updateParam('session')}
            />
          ) : (
            <AcademicFeedback empty={t('teacher.reviews.selectPrompt')} />
          )}
        </section>
      </div>
    </section>
  )
}
