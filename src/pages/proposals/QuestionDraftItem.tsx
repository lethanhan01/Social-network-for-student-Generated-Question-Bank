import { Trash2 } from 'lucide-react'
import { FormField, Input, Textarea } from '@/components/ui/forms'
import { Button } from '@/components/ui/actions'
import { Card } from '@/components/ui/data-display/Card'
import { Badge } from '@/components/ui/data-display/Badge'

export interface DraftOption {
  key: string
  text: string
  is_correct: boolean
}

export interface DraftQuestion {
  content: string
  options: DraftOption[]
  explanation: string
  confidence: number
}

export interface QuestionDraftItemProps {
  question: DraftQuestion
  index: number
  total: number
  onUpdate: (updater: (prev: DraftQuestion) => DraftQuestion) => void
  onRemove: () => void
}

export function QuestionDraftItem({
  question,
  index,
  total,
  onUpdate,
  onRemove,
}: Readonly<QuestionDraftItemProps>) {
  return (
    <Card as="article" variant="default" padding="sm" className="space-y-3 bg-surface border-line-subtle">
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Draft question header] */}
      <div className="flex items-center justify-between">
        <Badge tone="accent" size="xs">
          Câu hỏi {index + 1}
        </Badge>
        {total > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={onRemove}
            className="text-status-danger-fg"
            aria-label={`Xóa câu hỏi ${index + 1}`}
          >
            <Trash2 size={14} />
          </Button>
        )}
      </div>

      <FormField label="Nội dung đề bài câu hỏi" required>
        <Textarea
          aria-label="Nội dung đề bài câu hỏi"
          value={question.content}
          onChange={(e) => {
            const val = e.target.value
            onUpdate((item) => ({ ...item, content: val }))
          }}
          placeholder="Nhập nội dung câu hỏi trắc nghiệm..."
          rows={2}
        />
      </FormField>

      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Draft options grid] */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {question.options.map((opt, optIndex) => (
          /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Option input row] */
          <div key={opt.key} className="flex items-center gap-2">
            <Button
              type="button"
              variant={opt.is_correct ? 'primary' : 'outline'}
              size="xs"
              className="w-8 shrink-0 min-h-11"
              onClick={() => {
                onUpdate((item) => ({
                  ...item,
                  options: item.options.map((o, oi) => ({ ...o, is_correct: oi === optIndex })),
                }))
              }}
              aria-label={`Chọn đáp án ${opt.key} là đáp án đúng`}
            >
              {opt.key}
            </Button>
            <Input
              aria-label={`Nội dung đáp án ${opt.key}`}
              value={opt.text}
              onChange={(e) => {
                const val = e.target.value
                onUpdate((item) => ({
                  ...item,
                  options: item.options.map((o, oi) => (oi === optIndex ? { ...o, text: val } : o)),
                }))
              }}
              placeholder={`Đáp án ${opt.key}`}
            />
          </div>
        ))}
      </div>

      <FormField label="Lời giải thích chi tiết">
        <Input
          aria-label="Lời giải thích chi tiết"
          value={question.explanation}
          onChange={(e) => {
            const val = e.target.value
            onUpdate((item) => ({ ...item, explanation: val }))
          }}
          placeholder="Giải thích tại sao đáp án trên là chính xác..."
        />
      </FormField>
    </Card>
  )
}
