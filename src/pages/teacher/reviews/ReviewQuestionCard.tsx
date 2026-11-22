import { AlertTriangle, Check, Pencil, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge, Card, Image } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { Checkbox } from '@/components/ui/forms'
import { cn } from '@/utils/cn'
import type { DuplicateWarning } from '@/types'
import type { LiveSessionQuestionReviewDto } from '@/types/review.types'

interface ReviewQuestionCardProps {
  question: LiveSessionQuestionReviewDto
  index: number
  warnings: DuplicateWarning[]
  selected: boolean
  isResolved: boolean
  approving: boolean
  onToggleSelect: (id: number, checked: boolean) => void
  onEdit: (question: LiveSessionQuestionReviewDto) => void
  onApprove: (id: number) => void
  onReject: (id: number) => void
}

function statusTone(status?: string): 'success' | 'danger' | 'warning' | 'neutral' {
  if (status === 'APPROVED') return 'success'
  if (status === 'REJECTED') return 'danger'
  if (status === 'PENDING') return 'warning'
  return 'neutral'
}

type ReviewStatusKey = 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNKNOWN'

function resolveStatusKey(status?: string): ReviewStatusKey {
  if (status === 'PENDING' || status === 'APPROVED' || status === 'REJECTED') return status
  return 'UNKNOWN'
}

export function ReviewQuestionCard({
  question,
  index,
  warnings,
  selected,
  isResolved,
  approving,
  onToggleSelect,
  onEdit,
  onApprove,
  onReject,
}: Readonly<ReviewQuestionCardProps>) {
  const { t } = useTranslation('academic')
  const qId = question.question_id
  const isPending = !isResolved && question.status === 'PENDING' && qId != null
  const options = question.options ?? []
  const images = question.image_urls ?? []
  const statusKey = resolveStatusKey(question.status)

  return (
    <Card as="article" className="p-5 rounded-2xl bg-surface-card border border-line-subtle shadow-card space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <section className="flex items-center gap-2">
          {isPending ? (
            <Checkbox
              checked={selected}
              aria-label={t('teacher.reviews.selectQuestionAria', { index: index + 1 })}
              onCheckedChange={(checked) => onToggleSelect(qId, checked)}
            />
          ) : null}
          <Badge tone="accent" emphasis="subtle" size="sm">
            {t('teacher.reviews.questionIndex', { index: index + 1 })}
          </Badge>
          {question.difficulty ? (
            <Badge tone="neutral" emphasis="outline" size="sm">
              {t(`teacher.exams.difficulty.${question.difficulty}`, { defaultValue: question.difficulty })}
            </Badge>
          ) : null}
        </section>

        <Badge tone={statusTone(question.status)} emphasis="subtle" size="sm">
          {t(`status.${statusKey}`)}
        </Badge>
      </header>

      {warnings.length > 0 ? (
        <aside
          role="note"
          className="p-3 rounded-xl bg-status-warning-bg border border-line-subtle text-status-warning-fg space-y-1.5"
        >
          {warnings.map((warning, wIdx) => (
            <section key={`${warning.similar_question_id ?? wIdx}-${warning.tier ?? ''}`} className="space-y-0.5 text-xs">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle size={14} className="shrink-0" />
                <strong>
                  {t('teacher.reviews.duplicateTitle', {
                    score: Math.round((warning.similarity_score ?? 0) * 100),
                    tier: warning.tier ?? 'MATCH',
                  })}
                </strong>
                {warning.similar_question_id != null
                  ? ` · ${t('teacher.reviews.duplicateSimilarId', { id: warning.similar_question_id })}`
                  : ''}
              </p>
              {warning.matched_snipet ? <p className="opacity-90">{warning.matched_snipet}</p> : null}
            </section>
          ))}
        </aside>
      ) : null}

      <p className="text-base font-semibold text-fg-primary whitespace-pre-wrap">{question.content}</p>

      {images.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {images.map((url, imgIdx) => (
            <li key={url}>
              <Image
                src={url}
                alt={t('practice.imageAlt', { index: index + 1 + imgIdx })}
                fit="contain"
                radius="lg"
                containerClassName="max-h-60 w-full border border-line-subtle bg-surface-base"
              />
            </li>
          ))}
        </ul>
      ) : null}

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {options.map((opt) => {
          const isCorrect = Boolean(opt.is_correct) || opt.key === question.correct_answer
          return (
            <li
              key={opt.key}
              className={cn(
                'p-2.5 rounded-xl border',
                isCorrect
                  ? 'bg-action-accent-soft border-action-accent text-fg-primary font-medium'
                  : 'bg-surface-base border-line-subtle text-fg-muted'
              )}
            >
              <strong>{opt.key}.</strong> {opt.text}
            </li>
          )
        })}
      </ul>

      <section className="p-3 rounded-xl bg-surface-base border border-line-subtle text-xs text-fg-muted space-y-1">
        {question.correct_answer ? (
          <p>
            {t('teacher.reviews.correctAnswerLabel')}{' '}
            <strong className="text-action-accent font-bold">{question.correct_answer}</strong>
          </p>
        ) : null}
        {question.explanation ? (
          <p>
            {t('teacher.reviews.explanationLabel')} {question.explanation}
          </p>
        ) : null}
      </section>

      {isPending ? (
        <footer className="pt-3 border-t border-line-subtle flex flex-wrap items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="min-h-11 text-xs gap-1.5"
            leftIcon={<Pencil size={15} />}
            onClick={() => onEdit(question)}
          >
            {t('teacher.reviews.editButton')}
          </Button>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Approve and reject action button group] */}
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              className="min-h-11 text-xs gap-1.5"
              leftIcon={<X size={16} />}
              onClick={() => onReject(qId)}
            >
              {t('teacher.reviews.rejectButton')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="min-h-11 text-xs gap-1.5"
              leftIcon={<Check size={16} />}
              loading={approving}
              onClick={() => onApprove(qId)}
            >
              {t('teacher.reviews.approveButton')}
            </Button>
          </div>
        </footer>
      ) : null}
    </Card>
  )
}
