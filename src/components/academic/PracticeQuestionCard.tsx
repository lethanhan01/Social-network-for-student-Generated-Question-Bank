import { useState } from 'react'
import { BarChart3, CheckCircle2, MessageSquareWarning, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Badge, Card, Image } from '@/components/ui/data-display'
import { Form, RadioGroup } from '@/components/ui/forms'
import { Text } from '@/components/ui/typography'
import { useAnswerQuestionMutation } from '@/hooks/queries'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import type { AnswerQuestionResponse, PracticeQuestionDto } from '@/types'

interface PracticeQuestionCardProps {
  question: PracticeQuestionDto
  index: number
  rated: boolean
  onAnswered: (questionId: number, isCorrect: boolean | undefined) => void
  onRate: (questionId: number) => void
}

export function PracticeQuestionCard({ question, index, rated, onAnswered, onRate }: Readonly<PracticeQuestionCardProps>) {
  const { t } = useTranslation('academic')
  const questionId = question.question_id ?? 0
  const [selected, setSelected] = useState('')
  const [result, setResult] = useState<AnswerQuestionResponse | null>(null)
  const [validation, setValidation] = useState<string | null>(null)
  const answerMutation = useAnswerQuestionMutation()

  const answered = result !== null || question.my_interaction?.answered === true
  const correctAnswer = result?.correct_answer ?? question.hidden_fields?.correct_answer
  const explanation = result?.explanation ?? question.hidden_fields?.explanation
  const label = t('practice.questionLabel', { index: index + 1 })

  async function handleSubmit() {
    if (!selected) {
      setValidation(t('practice.selectRequired'))
      return
    }
    try {
      const response = await answerMutation.mutateAsync({
        questionId,
        payload: { selected_options: [selected], question_updated_at: question.updated_at },
      })
      setResult(response)
      onAnswered(questionId, response.is_correct)
    } catch (error) {
      toast.error(getApiError(error, t('practice.submitError')))
    }
  }

  function renderOptionBadge(key: string | undefined) {
    if (!answered || !key) return undefined
    if (key === correctAnswer) {
      return <Badge tone="success" size="xs">{t('practice.correctOption')}</Badge>
    }
    if (result && key === selected) {
      return <Badge tone="danger" size="xs">{t('practice.yourWrongOption')}</Badge>
    }
    return undefined
  }

  return (
    <Card as="article" variant="compact" aria-label={label} className="space-y-4">
      <header className="space-y-2">
        <Text size="xs" weight="semibold" tone="accent">
          {label}
        </Text>
        <Text as="p" className="whitespace-pre-wrap">
          {question.content}
        </Text>
        {(question.image_urls ?? []).map((url) => (
          <Image key={url} src={url} alt={t('practice.imageAlt', { index: index + 1 })} radius="lg" />
        ))}
      </header>

      <Form onSubmit={handleSubmit} noValidate aria-label={label} className="space-y-3">
        <fieldset className="space-y-2" disabled={answered}>
          <legend className="sr-only">{t('practice.optionsLegend', { index: index + 1 })}</legend>
          <RadioGroup
            name={`question-${questionId}`}
            value={selected}
            orientation="vertical"
            onValueChange={(value) => {
              setSelected(value)
              setValidation(null)
            }}
          >
            {(question.options ?? []).map((option) => (
              <RadioGroup.Card
                key={option.key}
                value={option.key ?? ''}
                title={`${option.key}. ${option.text}`}
                badge={renderOptionBadge(option.key)}
              />
            ))}
          </RadioGroup>
        </fieldset>
        {validation ? (
          <Text size="xs" tone="danger" role="alert">
            {validation}
          </Text>
        ) : null}
        {answered ? null : <SubmitButton loading={answerMutation.isPending}>{t('practice.submit')}</SubmitButton>}
      </Form>

      {answered ? (
        <section aria-live="polite" aria-label={t('practice.resultLabel')} className="space-y-3 border-t border-line-subtle pt-3">
          {result ? (
            <Badge
              tone={result.is_correct ? 'success' : 'danger'}
              leftIcon={result.is_correct ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
            >
              {t(result.is_correct ? 'practice.correct' : 'practice.incorrect')}
            </Badge>
          ) : (
            <Badge tone="neutral">{t('practice.alreadyAnswered')}</Badge>
          )}
          {correctAnswer ? (
            <Text as="p" size="sm">
              {t('practice.correctAnswer', { key: correctAnswer })}
            </Text>
          ) : null}
          {explanation ? (
            <Text as="p" size="sm" tone="muted" className="whitespace-pre-wrap">
              {explanation}
            </Text>
          ) : null}
          <nav aria-label={label} className="flex flex-wrap gap-2">
            
            {rated || question.my_interaction?.rated ? (
              <Badge tone="info" size="xs">{t('practice.rated')}</Badge>
            ) : (
              <Button
                variant="outline"
                size="sm"
                touchTarget
                leftIcon={<MessageSquareWarning size={16} />}
                onClick={() => onRate(questionId)}
              >
                {t('practice.rate')}
              </Button>
            )}
            <ButtonLink
              to={`/questions/${questionId}/analytics`}
              variant="ghost"
              size="sm"
              touchTarget
              leftIcon={<BarChart3 size={16} />}
            >
              {t('practice.viewAnalytics')}
            </ButtonLink>
          </nav>
        </section>
      ) : null}
    </Card>
  )
}

