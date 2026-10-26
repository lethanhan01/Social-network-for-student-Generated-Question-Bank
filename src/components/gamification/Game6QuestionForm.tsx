import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SubmitButton } from '@/components/ui/actions'
import { Checkbox, Form } from '@/components/ui/forms'
import { Text } from '@/components/ui/typography'
import { useSubmitGame6Mutation } from '@/hooks/queries/useGamificationQuery'
import { toast } from '@/lib/toast'
import { getApiError } from '@/lib/api-error'
import { formatDateTime } from '@/utils/date'
import type { Game6ActiveSessionResponse } from '@/types'

interface Game6QuestionFormProps {
  session: Game6ActiveSessionResponse
}

export function Game6QuestionForm({ session }: Readonly<Game6QuestionFormProps>) {
  const { t } = useTranslation('gamification')
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const submitMutation = useSubmitGame6Mutation()
  const questions = session.questions ?? []

  function toggleQuestion(questionId: number, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(questionId)
      } else {
        next.delete(questionId)
      }
      return next
    })
    if (error) setError(null)
  }

  function handleSubmit() {
    if (!session.session_id) return
    if (selectedIds.size === 0) {
      setError(t('minigames.game6.selectRequired'))
      return
    }
    submitMutation.mutate(
      { minigame_session_id: session.session_id, selected_llm_question_ids: [...selectedIds] },
      {
        onSuccess: () => {
          toast.success(t('minigames.success'))
          setSelectedIds(new Set())
        },
        onError: (err) => toast.error(t('minigames.error'), { description: getApiError(err) }),
      }
    )
  }

  return (
    <Form onSubmit={handleSubmit} noValidate aria-label={t('minigames.game6.title')} className="space-y-4">
      <fieldset className="space-y-3">
        <legend className="text-sm text-fg-secondary">{t('minigames.game6.hint')}</legend>
        <ol className="space-y-3">
          {questions.map((question, index) => {
            const questionId = question.question_id ?? 0
            const questionLabel = t('minigames.game6.questionLabel', { index: index + 1 })
            return (
              <li key={questionId} className="space-y-2 rounded-xl border border-line-subtle bg-surface-card p-4">
                <Text size="xs" weight="semibold" tone="accent">
                  {questionLabel}
                </Text>
                <Text size="sm">{question.content}</Text>
                {(question.options ?? []).length > 0 ? (
                  <ul className="space-y-1 text-sm text-fg-secondary">
                    {(question.options ?? []).map((option) => (
                      <li key={option.key ?? option.text}>
                        <strong className="font-semibold text-fg-primary">{option.key}.</strong> {option.text}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <Checkbox
                  label={t('minigames.game6.selectLabel')}
                  aria-label={`${questionLabel}: ${t('minigames.game6.selectLabel')}`}
                  checked={selectedIds.has(questionId)}
                  onCheckedChange={(checked) => toggleQuestion(questionId, checked)}
                />
              </li>
            )
          })}
        </ol>
      </fieldset>

      {error ? (
        <Text size="sm" tone="danger" role="alert">
          {error}
        </Text>
      ) : null}

      <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Text size="sm" tone="muted">
          {t('minigames.game6.selected', { count: selectedIds.size })}
          {session.end_time ? ` · ${t('minigames.game6.endsAt', { date: formatDateTime(session.end_time) })}` : null}
        </Text>
        <SubmitButton loading={submitMutation.isPending}>{t('minigames.submit')}</SubmitButton>
      </footer>
    </Form>
  )
}
