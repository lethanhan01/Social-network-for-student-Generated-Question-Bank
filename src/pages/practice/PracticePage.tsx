import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BackButton } from '@/components/ui/actions'
import { Badge } from '@/components/ui/data-display'
import { ProgressBar } from '@/components/ui/feedback'
import { Page, PageEmptyState, PageErrorState, PageHeader, PageSkeleton } from '@/components/ui/layout'
import { PracticeQuestionCard } from '@/components/academic/PracticeQuestionCard'
import { QuestionRatingModal } from '@/components/academic/QuestionRatingModal'
import { useSessionQuestionsQuery } from '@/hooks/queries'
import { getApiError } from '@/lib/api-error'

export default function PracticePage() {
  const { t } = useTranslation('academic')
  const { sessionId: sessionIdParam } = useParams<{ sessionId: string }>()
  const sessionId = Number(sessionIdParam)
  const sessionQuery = useSessionQuestionsQuery(sessionId)
  const [results, setResults] = useState<Record<number, boolean | undefined>>({})
  const [ratedIds, setRatedIds] = useState<number[]>([])
  const [ratingTarget, setRatingTarget] = useState<number | undefined>()

  const session = sessionQuery.data
  const questions = session?.questions ?? []
  const answeredCount = questions.filter(
    (question) => question.my_interaction?.answered || (question.question_id ?? 0) in results
  ).length
  const correctCount = Object.values(results).filter(Boolean).length

  function handleAnswered(questionId: number, isCorrect: boolean | undefined) {
    setResults((prev) => ({ ...prev, [questionId]: isCorrect }))
  }

  function renderBody() {
    if (!Number.isFinite(sessionId) || sessionId <= 0) {
      return <PageEmptyState title={t('practice.invalidSession')} />
    }
    if (sessionQuery.isLoading) return <PageSkeleton rows={3} />
    if (sessionQuery.isError) {
      return (
        <PageErrorState
          message={getApiError(sessionQuery.error, t('practice.loadError'))}
          onRetry={() => void sessionQuery.refetch()}
        />
      )
    }
    if (questions.length === 0) {
      return <PageEmptyState title={t('practice.empty.title')} description={t('practice.empty.description')} />
    }
    return (
      <>
        <ProgressBar
          value={answeredCount}
          max={questions.length}
          tone="accent"
          label={t('practice.progress', { answered: answeredCount, total: questions.length })}
          hint={t('practice.correctCount', { count: correctCount })}
        />
        <ol className="space-y-4" aria-label={t('practice.listLabel')}>
          {questions.map((question, index) => (
            <li key={question.question_id}>
              <PracticeQuestionCard
                question={question}
                index={index}
                rated={ratedIds.includes(question.question_id ?? 0)}
                onAnswered={handleAnswered}
                onRate={setRatingTarget}
              />
            </li>
          ))}
        </ol>
      </>
    )
  }

  return (
    <Page>
      <BackButton to="/proposals" label={t('common.back')} />
      <PageHeader
        eyebrow={session?.subject_code ?? t('eyebrow')}
        title={session?.title ?? t('practice.title')}
        description={session?.content ?? t('practice.description')}
        actions={
          session?.subject_name ? <Badge tone="accent">{session.subject_name}</Badge> : undefined
        }
      />
      {renderBody()}
      <QuestionRatingModal
        questionId={ratingTarget}
        sessionId={Number.isFinite(sessionId) ? sessionId : undefined}
        onClose={() => setRatingTarget(undefined)}
        onRated={(questionId) => setRatedIds((prev) => [...prev, questionId])}
      />
    </Page>
  )
}
