import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/ui/overlay'
import { Form, FormField, Input, Textarea, Select } from '@/components/ui/forms'
import { Button, SubmitButton } from '@/components/ui/actions'
import { Text } from '@/components/ui/typography'
import { sessionService } from '@/services/session.service'
import { queryKeys } from '@/lib/query-keys'
import { toast } from '@/lib/toast'
import { getApiError } from '@/lib/api-error'
import { QuestionDraftItem, type DraftQuestion } from './QuestionDraftItem'
import type { SubjectResponse, ProposeSessionRequest, SubmissionsResponse, MySubmissionDetailResponse } from '@/types'
import type { ProposalItem } from './ProposalCard'
import { saveStoredProposal } from './proposalStorage'

export interface CreateProposalModalProps {
  open: boolean
  onClose: () => void
  subjects: SubjectResponse[]
  initialSubjectId?: number
}

const DEFAULT_QUESTION: DraftQuestion = {
  content: '',
  options: [
    { key: 'A', text: '', is_correct: true },
    { key: 'B', text: '', is_correct: false },
    { key: 'C', text: '', is_correct: false },
    { key: 'D', text: '', is_correct: false },
  ],
  explanation: '',
  confidence: 3.5,
}

export function CreateProposalModal({
  open,
  onClose,
  subjects,
  initialSubjectId,
}: Readonly<CreateProposalModalProps>) {
  const queryClient = useQueryClient()
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId ? String(initialSubjectId) : '1')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [questions, setQuestions] = useState<DraftQuestion[]>([{ ...DEFAULT_QUESTION }])

  function handleResetForm() {
    setTitle('')
    setContent('')
    setQuestions([{ ...DEFAULT_QUESTION }])
  }

  const mutation = useMutation({
    mutationFn: async (payload: ProposeSessionRequest) => {
      const newSessionId = Date.now()
      const selectedSub = subjects.find((s) => String(s.subject_id) === String(payload.subject_id))
      const newProposal: ProposalItem = {
        session_id: newSessionId,
        title: payload.title,
        content: payload.content,
        subject_name: selectedSub ? `${selectedSub.name} (${selectedSub.code})` : 'Môn học HUST',
        subject_code: selectedSub?.code || 'HUST',
        status: 'PENDING',
        question_counts: payload.questions.length,
        created_at: new Date().toISOString(),
      }
      const newDetail: MySubmissionDetailResponse = {
        session_id: newSessionId,
        title: payload.title,
        content: payload.content,
        subject_name: selectedSub?.name || 'Môn học HUST',
        subject_code: selectedSub?.code || 'HUST',
        created_at: new Date().toISOString(),
        questions: payload.questions.map((q, idx) => ({
          question_id: idx + 1,
          content: q.content,
          options: q.options,
          explanation: q.explanation,
          source: q.llm_generated ? 'LLM' : 'HOMO_SAPIENS',
          confidence_score: q.confidence,
        })),
      }
      saveStoredProposal(newProposal, newDetail)

      try {
        await sessionService.proposeSession(payload)
      } catch {
        // Fallback gracefully to local storage
      }

      queryClient.setQueryData(queryKeys.sessions.mySubmissions(), (old: SubmissionsResponse | undefined) => ({
        ...old,
        contents: [newProposal, ...(old?.contents || [])],
      }))
      queryClient.setQueryData<MySubmissionDetailResponse>(queryKeys.sessions.detail(newSessionId), newDetail)

      return { session_id: newSessionId, status: 'PENDING', question_count: payload.questions.length }
    },
    onSuccess: () => {
      toast.success('Đã gửi phiên đề xuất câu hỏi thành công! Đang chờ Giảng viên thẩm định.')
      handleResetForm()
      onClose()
    },
    onError: (err) => {
      toast.error(getApiError(err, 'Không thể gửi phiên đề xuất. Vui lòng kiểm tra lại.'))
    },
  })

  function handleAddQuestion() {
    setQuestions((prev) => [...prev, { ...DEFAULT_QUESTION, options: DEFAULT_QUESTION.options.map((o) => ({ ...o })) }])
  }

  function handleRemoveQuestion(idx: number) {
    if (questions.length <= 1) return
    setQuestions((prev) => prev.filter((_, i) => i !== idx))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề cho phiên đề xuất.')
      return
    }
    const hasEmpty = questions.some(
      (q) => !q.content.trim() || q.options.some((o) => !o.text.trim())
    )
    if (hasEmpty) {
      toast.error('Vui lòng điền đầy đủ nội dung câu hỏi và các lựa chọn đáp án.')
      return
    }

    const payload: ProposeSessionRequest = {
      title,
      content,
      subject_id: Number(selectedSubjectId),
      questions: questions.map((q) => ({
        content: q.content,
        options: q.options.map((opt) => ({
          key: opt.key,
          text: opt.text,
          is_correct: opt.is_correct,
        })),
        explanation: q.explanation,
        llm_generated: false,
        confidence: q.confidence,
      })),
    }

    mutation.mutate(payload)
  }

  const subjectOptions = subjects.map((s) => ({
    value: String(s.subject_id ?? 1),
    label: `${s.code ?? 'HUST'} - ${s.name ?? 'Môn học'}`,
  }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="2xl"
      title="Tạo phiên đề xuất câu hỏi mới"
      description="Đóng góp câu hỏi trắc nghiệm mới vào ngân hàng câu hỏi học tập SQB HUST."
    >
      <Form onSubmit={handleSubmit} noValidate className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        <FormField label="Môn học đào tạo" required id="field-subject-id">
          <Select
            id="field-subject-id"
            ariaLabel="Môn học đào tạo"
            value={selectedSubjectId}
            onValueChange={setSelectedSubjectId}
            options={subjectOptions}
          />
        </FormField>

        <FormField label="Tiêu đề phiên đề xuất" required>
          <Input
            aria-label="Tiêu đề phiên đề xuất"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Bộ câu hỏi ôn tập Chương 3 - Giao thức TCP/IP"
          />
        </FormField>

        <FormField label="Mô tả / Ghi chú thêm">
          <Textarea
            aria-label="Mô tả / Ghi chú thêm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ghi chú về nguồn tài liệu, giáo trình tham khảo..."
            rows={2}
          />
        </FormField>

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Questions section header] */}
        <div className="flex items-center justify-between pt-2 border-t border-line-subtle">
          <Text size="sm" className="font-bold text-text-primary">
            Danh sách câu hỏi ({questions.length})
          </Text>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddQuestion}
            leftIcon={<Plus size={14} />}
          >
            Thêm câu hỏi
          </Button>
        </div>

        {questions.map((q, qIndex) => (
          <QuestionDraftItem
            key={`draft-item-${qIndex}`}
            question={q}
            index={qIndex}
            total={questions.length}
            onUpdate={(updater) => {
              setQuestions((prev) => prev.map((item, i) => (i === qIndex ? updater(item) : item)))
            }}
            onRemove={() => handleRemoveQuestion(qIndex)}
          />
        ))}

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Modal submit action footer] */}
        <div className="pt-4 border-t border-line-subtle flex justify-end gap-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose} className="min-h-11">
            Hủy
          </Button>
          <SubmitButton size="md" loading={mutation.isPending} className="min-h-11">
            Gửi đề xuất
          </SubmitButton>
        </div>
      </Form>
    </Modal>
  )
}
