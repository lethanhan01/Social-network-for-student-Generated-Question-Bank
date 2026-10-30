import { useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { AcademicLayout } from '@/components/academic/AcademicLayout'
import { AcademicFeedback } from '@/components/academic/AcademicFeedback'
import { useAcademicSessionsQuery, useSessionQuestionsQuery } from '@/hooks/queries/useAcademicQuery'
import { ButtonLink } from '@/components/ui/actions/Button'
import { Button } from '@/components/ui/actions/Button'
import { Card } from '@/components/ui/data-display/Card'
import { canPracticeSession, positiveId, type AcademicSession } from '@/types/academic.types'
import { PracticeQuestion } from './PracticeQuestion'

export default function PracticePage() {
  const { t } = useTranslation('academic')
  const client = useQueryClient()
  const { sessionId: rawId } = useParams()
  const id = positiveId(rawId)
  const [params, setParams] = useSearchParams()
  const subjectId = positiveId(params.get('subjectId'))
  const sessions = useAcademicSessionsQuery('RESOLVED', !rawId)
  const query = useSessionQuestionsQuery(id)
  const questions = query.data?.questions ?? []
  const rawIndex = Number(params.get('question'))
  const index = Number.isSafeInteger(rawIndex) && rawIndex >= 0 ? rawIndex : 0
  const validIndex = /^\d+$/.test(params.get('question') ?? '0') && Number.isSafeInteger(rawIndex) && rawIndex >= 0
  const current = validIndex ? questions[index] : undefined
  const list = (sessions.data?.pages.flatMap((page) => page.contents ?? []) ?? []).filter((session) =>
    (!subjectId || session.subject_id === subjectId) &&
    (!('status' in session) || canPracticeSession(session as AcademicSession)))
  return (
    <AcademicLayout title={query.data?.title ?? t('practice.title')} subtitle={t('practice.subtitle')}>
      {rawId && !id ? <AcademicFeedback empty={t('practice.invalid')} /> : !id ? (
        sessions.isPending ? <AcademicFeedback pending /> : sessions.isError ? <AcademicFeedback error={sessions.error} onRetry={sessions.refetch} /> : (
          <section className="space-y-4">
            {list.length === 0 ? <AcademicFeedback empty={t('practice.empty')} /> : list.map((session) => (
              <Card as="article" key={session.session_id} className="space-y-4 rounded-2xl">
                <h2 className="text-lg font-bold">{session.title}</h2><p className="text-sm text-text-muted">{session.subject_name}</p>
                {session.session_id ? <ButtonLink to={`/practice/${session.session_id}`} variant="primary">{t('practice.open')}</ButtonLink> : null}
              </Card>
            ))}
            {sessions.hasNextPage ? <Button loading={sessions.isFetchingNextPage} onClick={() => { void sessions.fetchNextPage() }}>{t('loadMore')}</Button> : null}
          </section>
        )
      ) : query.isPending ? <AcademicFeedback pending /> : query.isError ? <AcademicFeedback error={query.error} onRetry={query.refetch} /> : !current ? (
        <section className="space-y-3">
          <AcademicFeedback empty={t(questions.length ? (validIndex && index === questions.length && params.get('completed') === '1' ? 'practice.completed' : 'practice.invalid') : 'practice.empty')} />
          {questions.length > 0 ? <Button onClick={() => {
            questions.forEach((question) => client.removeQueries({ queryKey: queryKeys.practice.answer(question.question_id ?? 0, question.updated_at) }))
            setParams((previous) => { const next = new URLSearchParams(previous); next.set('question', '0'); next.delete('completed'); return next })
          }}>{t('practice.restart')}</Button> : null}
        </section>
      ) : (
        <section className="space-y-4">
          <p className="text-sm text-text-muted">{t('practice.progress', { current: index + 1, total: questions.length })}</p>
          <PracticeQuestion key={`${id}-${index}-${current.question_id}-${current.updated_at}`} question={current} sessionId={id} questionIndex={index}
            onNext={() => setParams((previous) => {
              const next = new URLSearchParams(previous)
              next.set('question', String(index + 1))
              if (index + 1 === questions.length) next.set('completed', '1')
              return next
            })} />
        </section>
      )}
      {id ? <ButtonLink to="/practice" variant="ghost">{t('practice.choose')}</ButtonLink> : null}
    </AcademicLayout>
  )
}
