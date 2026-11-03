import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/data-display/Card'
import { Button } from '@/components/ui/actions/Button'
import { ButtonLink } from '@/components/ui/actions/Button'
import { useAnswerQuestionMutation } from '@/hooks/queries/useAcademicQuery'
import { getApiError } from '@/lib/api-error'
import type { AnswerQuestionResponse, PracticeQuestionDto } from '@/types'
import { QuestionRatingModal } from './QuestionRatingModal'

export function PracticeQuestion({ question, sessionId, onNext, questionIndex = 0 }: Readonly<{
  question: PracticeQuestionDto; sessionId: number; onNext: () => void; questionIndex?: number
}>) {
  const { t } = useTranslation('academic')
  const client = useQueryClient()
  const [saved] = useState(() => client.getQueryData<{ result: AnswerQuestionResponse; selected: string[] }>(
    queryKeys.practice.answer(question.question_id ?? 0, question.updated_at)))
  const [selected, setSelected] = useState<string[]>(saved?.selected ?? [])
  const [rating, setRating] = useState(false)
  const answer = useAnswerQuestionMutation(question.question_id ?? 0)
  const result = answer.data ?? saved?.result
  function toggle(key: string) {
    answer.reset()
    setSelected((previous) => previous.includes(key) ? previous.filter((item) => item !== key) : [...previous, key])
  }
  return (
    <Card as="article" className="space-y-5 rounded-2xl">
      <h2 className="whitespace-pre-wrap text-lg font-semibold">{question.content}</h2>
      <p className="text-sm text-text-muted">{t('practice.select')}</p>
      <section className="space-y-3" aria-label={t('composer.options')}>
        {(question.options ?? []).map((option) => <Button key={option.key} variant={selected.includes(option.key ?? '') ? 'secondary' : 'outline'}
          aria-pressed={selected.includes(option.key ?? '')} disabled={answer.isPending || Boolean(result) || !option.key}
          className="min-h-12 w-full justify-start whitespace-normal text-left"
          onClick={() => toggle(option.key ?? '')}>{option.key}. {option.text}</Button>)}
      </section>
      {answer.isError ? <p role="alert" className="text-status-danger-fg">{getApiError(answer.error, t('saveError'))}</p> : null}
      {result ? <section role="status" className="space-y-3 rounded-xl bg-surface-sunken p-4">
        <h3 className="font-semibold">{t(result.is_correct ? 'practice.correct' : 'practice.incorrect')}</h3>
        {result.correct_answer ? <p>{t('practice.correctAnswer', { answer: result.correct_answer })}</p> : null}
        {result.explanation ? <p className="whitespace-pre-wrap text-sm">{result.explanation}</p> : null}
      </section> : null}
      <footer className="flex flex-wrap gap-2 border-t border-line-subtle pt-4">
        {!result ? <Button loading={answer.isPending} disabled={!selected.length || !question.question_id}
          onClick={() => answer.mutate({ selected_options: selected, question_updated_at: question.updated_at })}>{t('practice.submit')}</Button> : (
          <>
            <Button onClick={onNext}>{t('practice.next')}</Button>
            <Button variant="ghost" onClick={() => setRating(true)}>{t('practice.rate')}</Button>
            <ButtonLink variant="ghost" to={`/questions/${question.question_id}/analytics?sessionId=${sessionId}&question=${questionIndex}`}>{t('analytics.title')}</ButtonLink>
          </>
        )}
      </footer>
      {rating && question.question_id ? <QuestionRatingModal questionId={question.question_id} onClose={() => setRating(false)} /> : null}
    </Card>
  )
}
