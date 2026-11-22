import { useState, type ReactNode } from 'react'
import { Check, CheckCircle2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { BackButton, Button } from '@/components/ui/actions'
import { Badge, Card } from '@/components/ui/data-display'
import { Checkbox } from '@/components/ui/forms'
import { ConfirmDialog } from '@/components/ui/overlay'
import { Heading, Text } from '@/components/ui/typography'
import { AcademicFeedback } from '@/components/academic/AcademicFeedback'
import {
  useApproveQuestionsMutation,
  useCompleteSessionReviewMutation,
  useRejectQuestionsMutation,
  useSessionReviewDetailQuery,
} from '@/hooks/queries/useReviewQuery'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import type { DuplicateWarning, PendingSessionItemDto } from '@/types'
import type { LiveSessionQuestionReviewDto } from '@/types/review.types'
import { ReviewQuestionCard } from './ReviewQuestionCard'
import { EditReviewQuestionModal } from './EditReviewQuestionModal'
import { RejectQuestionsModal } from './RejectQuestionsModal'

interface ReviewSessionPanelProps {
  sessionId: number
  summary?: PendingSessionItemDto
  onBack: () => void
  onCompleted: () => void
}

function mapWarningsByIndex(warnings: DuplicateWarning[], totalQuestions: number): Map<number, DuplicateWarning[]> {
  const map = new Map<number, DuplicateWarning[]>()
  const looksOneBased =
    warnings.length > 0 &&
    warnings.every((w) => (w.question_index ?? 0) >= 1) &&
    warnings.some((w) => w.question_index === totalQuestions)

  for (const warning of warnings) {
    if (warning.question_index == null) continue
    const idx = looksOneBased ? warning.question_index - 1 : warning.question_index
    const list = map.get(idx) ?? []
    list.push(warning)
    map.set(idx, list)
  }
  return map
}

export function ReviewSessionPanel({
  sessionId,
  summary,
  onBack,
  onCompleted,
}: Readonly<ReviewSessionPanelProps>) {
  const { t } = useTranslation('academic')
  const detailQuery = useSessionReviewDetailQuery(sessionId)
  const approveMutation = useApproveQuestionsMutation()
  const rejectMutation = useRejectQuestionsMutation()
  const completeMutation = useCompleteSessionReviewMutation()

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [editingQuestion, setEditingQuestion] = useState<LiveSessionQuestionReviewDto | null>(null)
  const [rejectTargetIds, setRejectTargetIds] = useState<number[] | null>(null)
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false)

  const questions = detailQuery.data?.items ?? []
  const isResolved = detailQuery.data?.session_status === 'RESOLVED'
  const pendingIds = questions
    .filter((item) => item.status === 'PENDING' && item.question_id != null)
    .map((item) => item.question_id!)
  const activeSelectedIds = selectedIds.filter((id) => pendingIds.includes(id))
  const allPendingSelected = pendingIds.length > 0 && activeSelectedIds.length === pendingIds.length
  const warningsMap = mapWarningsByIndex(detailQuery.data?.duplicate_warnings ?? [], questions.length)
  const processedCount = questions.length - pendingIds.length

  function handleToggleSelect(id: number, checked: boolean) {
    setSelectedIds((prev) => (checked ? Array.from(new Set([...prev, id])) : prev.filter((item) => item !== id)))
  }

  async function handleApprove(ids: number[]) {
    if (ids.length === 0) return
    try {
      const response = await approveMutation.mutateAsync({ question_ids: ids })
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)))
      const points = response?.points_earned ?? 0
      toast.success(
        points > 0
          ? t('teacher.reviews.approveSuccessWithPoints', { points })
          : t('teacher.reviews.approveSuccess')
      )
    } catch (error) {
      toast.error(getApiError(error, t('teacher.reviews.approveError')))
    }
  }

  async function handleRejectConfirm(reason: string) {
    if (!rejectTargetIds || rejectTargetIds.length === 0) return
    try {
      await rejectMutation.mutateAsync({ question_ids: rejectTargetIds, reason })
      setSelectedIds((prev) => prev.filter((id) => !rejectTargetIds.includes(id)))
      setRejectTargetIds(null)
      toast.success(t('teacher.reviews.rejectSuccess'))
    } catch (error) {
      toast.error(getApiError(error, t('teacher.reviews.rejectError')))
    }
  }

  async function handleCompleteConfirm() {
    try {
      await completeMutation.mutateAsync(sessionId)
      setConfirmCompleteOpen(false)
      toast.success(t('teacher.reviews.completeSuccess'))
      onCompleted()
    } catch (error) {
      toast.error(getApiError(error, t('teacher.reviews.completeError')))
    }
  }

  let questionsContent: ReactNode
  if (detailQuery.isPending) {
    questionsContent = <AcademicFeedback pending />
  } else if (detailQuery.isError) {
    questionsContent = <AcademicFeedback error={detailQuery.error} onRetry={detailQuery.refetch} />
  } else if (questions.length === 0) {
    questionsContent = <AcademicFeedback empty={t('teacher.reviews.emptyQuestions')} />
  } else {
    questionsContent = (
      <section className="space-y-4">
        {questions.map((question, index) => (
          <ReviewQuestionCard
            key={question.question_id ?? question.content ?? 'question'}
            question={question}
            index={index}
            warnings={warningsMap.get(index) ?? []}
            selected={question.question_id != null && activeSelectedIds.includes(question.question_id)}
            isResolved={isResolved}
            approving={approveMutation.isPending}
            onToggleSelect={handleToggleSelect}
            onEdit={setEditingQuestion}
            onApprove={(id) => { void handleApprove([id]) }}
            onReject={(id) => setRejectTargetIds([id])}
          />
        ))}
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <Card as="section" className="p-5 rounded-2xl bg-surface-card border border-line-subtle shadow-card space-y-3">
        <BackButton label={t('teacher.reviews.backToList')} onClick={onBack} className="lg:hidden" />

        <header className="flex flex-wrap items-start justify-between gap-3">
          <section className="space-y-1 min-w-0">
            {summary?.topic ? <Badge tone="accent" emphasis="subtle" size="sm">{summary.topic}</Badge> : null}
            <Heading level={2} className="text-xl font-bold text-fg-primary">
              {summary?.title || t('teacher.reviews.sessionHeading', { id: sessionId })}
            </Heading>
            {summary?.author?.full_name ? (
              <Text size="xs" tone="muted">
                {t('teacher.reviews.authorLabel')} <strong className="text-fg-primary">{summary.author.full_name}</strong>
              </Text>
            ) : null}
          </section>

          <Badge tone={isResolved ? 'success' : 'neutral'} emphasis="subtle" size="sm">
            {isResolved
              ? t('teacher.reviews.resolvedBadge')
              : t('teacher.reviews.progressLabel', { done: processedCount, total: questions.length })}
          </Badge>
        </header>

        {!isResolved && pendingIds.length > 0 ? (
          <section className="pt-3 border-t border-line-subtle flex flex-wrap items-center justify-between gap-2">
            <Checkbox
              checked={allPendingSelected}
              label={t('teacher.reviews.selectAllPending', { count: pendingIds.length })}
              onCheckedChange={(checked) => setSelectedIds(checked ? pendingIds : [])}
            />
            {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Batch approve and reject toolbar buttons] */}
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="danger" size="sm" className="min-h-11 text-xs gap-1.5" leftIcon={<X size={16} />} disabled={activeSelectedIds.length === 0} onClick={() => setRejectTargetIds(activeSelectedIds)}>
                {t('teacher.reviews.rejectSelected', { count: activeSelectedIds.length })}
              </Button>
              <Button variant="primary" size="sm" className="min-h-11 text-xs gap-1.5" leftIcon={<Check size={16} />} disabled={activeSelectedIds.length === 0} loading={approveMutation.isPending} onClick={() => { void handleApprove(activeSelectedIds) }}>
                {t('teacher.reviews.approveSelected', { count: activeSelectedIds.length })}
              </Button>
            </div>
          </section>
        ) : null}
      </Card>

      {questionsContent}

      {!isResolved && !detailQuery.isPending && !detailQuery.isError && questions.length > 0 ? (
        <Card as="section" className="p-4 rounded-2xl bg-surface-card border border-line-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Text size="xs" tone="muted">
            {pendingIds.length > 0
              ? t('teacher.reviews.pendingRemaining', { count: pendingIds.length })
              : t('teacher.reviews.progressLabel', { done: processedCount, total: questions.length })}
          </Text>
          <Button variant="primary" className="min-h-11 gap-2 shrink-0" leftIcon={<CheckCircle2 size={18} />} disabled={pendingIds.length > 0} onClick={() => setConfirmCompleteOpen(true)}>
            {t('teacher.reviews.completeReview')}
          </Button>
        </Card>
      ) : null}

      {editingQuestion ? (
        <EditReviewQuestionModal key={editingQuestion.question_id} question={editingQuestion} onClose={() => setEditingQuestion(null)} />
      ) : null}

      {rejectTargetIds ? (
        <RejectQuestionsModal questionIds={rejectTargetIds} loading={rejectMutation.isPending} onConfirm={handleRejectConfirm} onClose={() => setRejectTargetIds(null)} />
      ) : null}

      <ConfirmDialog
        open={confirmCompleteOpen}
        title={t('teacher.reviews.completeConfirmTitle')}
        description={t('teacher.reviews.completeConfirmDesc')}
        confirmLabel={t('teacher.reviews.completeConfirmButton')}
        loading={completeMutation.isPending}
        onConfirm={handleCompleteConfirm}
        onClose={() => setConfirmCompleteOpen(false)}
      />
    </section>
  )
}
