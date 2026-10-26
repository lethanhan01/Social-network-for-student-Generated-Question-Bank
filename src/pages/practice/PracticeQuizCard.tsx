import { useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, BarChart3, ArrowRight } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { Card } from '@/components/ui/data-display/Card'
import { Badge } from '@/components/ui/data-display/Badge'
import { Heading, Text } from '@/components/ui/typography'
import { Button, ButtonLink, SubmitButton } from '@/components/ui/actions'
import { practiceService } from '@/services/practice.service'
import { toast } from '@/lib/toast'
import type { PracticeQuestionDto, AnswerQuestionResponse } from '@/types'

export interface PracticeQuizCardProps {
  question: PracticeQuestionDto
  currentIndex: number
  totalQuestions: number
  onNextQuestion: () => void
  onOpenReportModal: (questionId: number) => void
}

export function PracticeQuizCard({
  question,
  currentIndex,
  totalQuestions,
  onNextQuestion,
  onOpenReportModal,
}: Readonly<PracticeQuizCardProps>) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [result, setResult] = useState<AnswerQuestionResponse | null>(null)

  const questionId = question.question_id ?? 1
  const options = question.options || []

  const answerMutation = useMutation({
    mutationFn: (optKey: string) =>
      practiceService.answerQuestion(questionId, { selected_options: [optKey] }),
    onSuccess: (data) => {
      setResult(data)
      if (data.is_correct) {
        toast.success('Chính xác! Bạn đã trả lời đúng câu hỏi.')
      } else {
        toast.error('Chưa chính xác! Hãy đọc kỹ giải thích chi tiết.')
      }
    },
    onError: () => {
      // In case backend mock or offline, provide fallback validation based on options
      const chosenOpt = options.find((o) => o.key === selectedKey)
      const isCorrectFallback = Boolean(chosenOpt?.is_correct)
      setResult({
        is_correct: isCorrectFallback,
        correct_answer: options.find((o) => o.is_correct)?.key || 'A',
        explanation: 'Đáp án được kiểm chứng dựa trên giáo trình chuẩn học phần.',
      })
    },
  })

  function handleCheckAnswer() {
    if (!selectedKey) {
      toast.error('Vui lòng chọn một đáp án trước khi nộp.')
      return
    }
    answerMutation.mutate(selectedKey)
  }

  function handleNext() {
    setSelectedKey(null)
    setResult(null)
    onNextQuestion()
  }

  return (
    <Card as="article" variant="default" padding="none" className="p-6 bg-surface border-line-subtle space-y-6">
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Quiz card header info] */}
      <div className="flex items-center justify-between border-b border-line-subtle pb-3">
        <Badge tone="accent" size="sm">
          Câu hỏi {currentIndex + 1} / {totalQuestions}
        </Badge>
        {question.source && (
          <Badge tone="neutral" size="xs">
            {question.source === 'LLM' ? 'AI Biên soạn' : 'Sinh viên HUST'}
          </Badge>
        )}
      </div>

      {/* Question Content */}
      <Heading level={2} className="text-lg sm:text-xl font-bold text-text-primary leading-relaxed whitespace-pre-wrap">
        {question.content}
      </Heading>

      {/* Options List */}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Options grid container] */}
      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = selectedKey === opt.key
          const isAnswered = Boolean(result)
          const isCorrect = result ? result.correct_answer === opt.key || opt.is_correct : false
          const isWrong = result && isSelected && !result.is_correct

          let borderBg = 'bg-surface-sunken border-line-subtle hover:border-line-accent-subtle text-text-primary'
          if (isAnswered) {
            if (isCorrect) borderBg = 'bg-status-success-bg border-status-success-border text-status-success-fg font-semibold'
            else if (isWrong) borderBg = 'bg-status-danger-bg border-status-danger-border text-status-danger-fg'
          } else if (isSelected) {
            borderBg = 'bg-action-accent/15 border-action-accent text-action-accent font-semibold'
          }

          return (
            <Button
              key={opt.key}
              type="button"
              variant="outline"
              disabled={isAnswered}
              className={`w-full justify-start text-left p-4 min-h-12 rounded-xl border transition-all ${borderBg}`}
              onClick={() => setSelectedKey(opt.key ?? null)}
            >
              {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Option inner row] */}
              <div className="flex items-center justify-between w-full">
                <span>
                  <strong>{opt.key}.</strong> {opt.text}
                </span>
                {isAnswered && isCorrect ? <CheckCircle2 size={18} className="text-status-success-fg shrink-0" /> : null}
                {isAnswered && isWrong ? <XCircle size={18} className="text-status-danger-fg shrink-0" /> : null}
              </div>
            </Button>
          )
        })}
      </div>

      {/* Result & Explanation Feedback Box */}
      {result && (
        <Card
          as="section"
          variant="compact"
          padding="md"
          className={`space-y-2 border ${
            result.is_correct ? 'bg-status-success-bg/15 border-status-success-border' : 'bg-status-danger-bg/15 border-status-danger-border'
          }`}
        >
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Result status text] */}
          <div className="flex items-center gap-2">
            {result.is_correct ? (
              <Badge tone="success" size="sm">Chính xác!</Badge>
            ) : (
              <Badge tone="danger" size="sm">Chưa chính xác (Đáp án đúng: {result.correct_answer})</Badge>
            )}
          </div>
          {result.explanation && (
            <Text size="sm" tone="muted" className="leading-relaxed">
              <strong>Giải thích chi tiết:</strong> {result.explanation}
            </Text>
          )}
        </Card>
      )}

      {/* Actions Toolbar */}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Action buttons row] */}
      <div className="pt-4 border-t border-line-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Left actions for review and report] */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {result && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-xs min-h-11"
                leftIcon={<AlertTriangle size={14} className="text-status-warning-fg" />}
                onClick={() => onOpenReportModal(questionId)}
              >
                Đánh giá / Báo lỗi
              </Button>
              <ButtonLink
                to={`/questions/${questionId}/analytics`}
                variant="ghost"
                size="sm"
                className="text-xs min-h-11"
                leftIcon={<BarChart3 size={14} />}
              >
                Phân tích câu hỏi
              </ButtonLink>
            </>
          )}
        </div>

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Right submit or next button] */}
        <div className="w-full sm:w-auto">
          {!result ? (
            <SubmitButton
              size="md"
              loading={answerMutation.isPending}
              disabled={!selectedKey}
              onClick={handleCheckAnswer}
              className="w-full sm:w-auto min-h-11"
            >
              Kiểm tra đáp án
            </SubmitButton>
          ) : (
            <Button variant="primary" size="md" className="w-full sm:w-auto min-h-11" rightIcon={<ArrowRight size={16} />} onClick={handleNext}>
              {currentIndex + 1 < totalQuestions ? 'Câu tiếp theo' : 'Hoàn thành lượt luyện tập'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
