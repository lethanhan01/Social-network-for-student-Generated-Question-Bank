import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/ui/overlay'
import { Form, FormField, Textarea, Checkbox } from '@/components/ui/forms'
import { Button, SubmitButton } from '@/components/ui/actions'
import { Card } from '@/components/ui/data-display/Card'
import { Badge } from '@/components/ui/data-display/Badge'
import { Text } from '@/components/ui/typography'
import { practiceService } from '@/services/practice.service'
import { queryKeys } from '@/lib/query-keys'
import { toast } from '@/lib/toast'
import { getApiError } from '@/lib/api-error'
import type { RateQuestionRequest } from '@/types'

export interface QuestionReportModalProps {
  questionId: number
  open: boolean
  onClose: () => void
}

const RATING_LEVELS = [
  { score: 0, label: '0 - Sai đề / Lỗi kiến thức', desc: 'Sai đáp án, thiếu dữ kiện hoặc thông tin sai lệch' },
  { score: 1, label: '1 - LLM bịa (Ảo giác)', desc: 'Câu hỏi có dấu hiệu hallucination, không thực tế' },
  { score: 2, label: '2 - Chưa vững kiến thức', desc: 'Câu hỏi mơ hồ, câu từ chưa chuẩn xác' },
  { score: 3, label: '3 - Chuẩn kiến thức cơ bản', desc: 'Đầy đủ nội dung, đáp án rõ ràng, đạt chuẩn' },
  { score: 4, label: '4 - Câu hỏi hay, phân hóa cao', desc: 'Ý tưởng xuất sắc, phân hóa sinh viên tốt' },
]

export function QuestionReportModal({ questionId, open, onClose }: Readonly<QuestionReportModalProps>) {
  const queryClient = useQueryClient()
  const [rating, setRating] = useState<number>(3)
  const [isError, setIsError] = useState<boolean>(false)
  const [comment, setComment] = useState<string>('')

  const mutation = useMutation({
    mutationFn: (payload: RateQuestionRequest) => practiceService.rateQuestion(questionId, payload),
    onSuccess: () => {
      toast.success(
        isError
          ? 'Đã gửi báo lỗi câu hỏi (Game 5) tới Giảng viên thẩm định! Bạn sẽ nhận xu thưởng nếu báo lỗi chính xác.'
          : 'Cảm ơn bạn đã gửi đánh giá chất lượng câu hỏi!'
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.statistics(questionId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.ratings(questionId) })
      onClose()
    },
    onError: (err) => {
      toast.error(getApiError(err, 'Không thể gửi đánh giá. Vui lòng thử lại.'))
    },
  })

  function handleToggleError(checked: boolean) {
    setIsError(checked)
    if (checked) {
      setRating(0)
    } else {
      setRating(3)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate({
      rating: isError ? 0 : rating,
      is_error: isError,
      comment: comment.trim() || undefined,
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Đánh giá & Báo lỗi Câu hỏi"
      description="Tham gia thẩm định chất lượng câu hỏi cộng đồng và nhận thưởng Game 5 khi phát hiện sai sót kiến thức."
    >
      <Form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Game 5 Error Reporting Option */}
        <Card as="section" variant="default" padding="sm" className="border-status-warning-border bg-status-warning-bg/10 space-y-2">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Game 5 checkbox container] */}
          <div className="flex items-start gap-2">
            <Checkbox
              checked={isError}
              onChange={(e) => handleToggleError(e.target.checked)}
              id="game5-error-check"
            />
            {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Label and game 5 badge] */}
            <div>
              <label htmlFor="game5-error-check" className="text-xs font-bold text-text-primary flex items-center gap-1.5 cursor-pointer">
                <span>Báo lỗi sai đề / kiến thức sai lệch</span>
                <Badge tone="warning" size="xs">Game 5 Thẩm định</Badge>
              </label>
              <Text size="xs" tone="muted" className="mt-0.5">
                Báo lỗi này sẽ được gửi tới Giảng viên. Nếu được xác nhận là lỗi chính xác, bạn sẽ nhận được xu thưởng học thuật!
              </Text>
            </div>
          </div>
        </Card>

        {/* Rating Score Selection (0 - 4) */}
        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wider text-fg-secondary">
            Mức độ chất lượng câu hỏi
          </legend>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Rating buttons list] */}
          <div className="space-y-1.5">
            {RATING_LEVELS.map((lvl) => {
              const isSelected = isError ? lvl.score === 0 : rating === lvl.score
              return (
                <Button
                  key={lvl.score}
                  type="button"
                  variant={isSelected ? 'primary' : 'outline'}
                  size="sm"
                  disabled={isError && lvl.score !== 0}
                  className="w-full justify-start text-left min-h-11 px-3"
                  onClick={() => setRating(lvl.score)}
                >
                  {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Button inner text and icon] */}
                  <div className="flex items-center justify-between w-full">
                    <span>{lvl.label}</span>
                    {isSelected ? <CheckCircle2 size={16} className="text-text-inverse shrink-0" /> : null}
                  </div>
                </Button>
              )
            })}
          </div>
        </fieldset>

        {/* Comment field */}
        <FormField label="Chi tiết nhận xét hoặc mô tả lỗi">
          <Textarea
            aria-label="Chi tiết nhận xét hoặc mô tả lỗi"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              isError
                ? 'Mô tả rõ chỗ sai trong đề bài, đáp án đúng phải là gì, tại sao...'
                : 'Nhận xét độ khó, cách giải thích hoặc mẹo ghi nhớ cho câu hỏi...'
            }
            rows={3}
          />
        </FormField>

        {/* Actions footer */}
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Modal button actions container] */}
        <div className="pt-3 border-t border-line-subtle flex justify-end gap-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose} className="min-h-11">
            Hủy
          </Button>
          <SubmitButton size="md" loading={mutation.isPending} className="min-h-11">
            {isError ? 'Gửi báo lỗi Game 5' : 'Gửi đánh giá'}
          </SubmitButton>
        </div>
      </Form>
    </Modal>
  )
}
