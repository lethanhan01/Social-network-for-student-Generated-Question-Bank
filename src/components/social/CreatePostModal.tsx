import { useState } from 'react'
import { Modal } from '@/components/ui/overlay'
import { Form, FormField, Textarea, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/forms'
import { Button, SubmitButton } from '@/components/ui/actions'
import { Text } from '@/components/ui/typography'
import type { SubjectResponse, CreatePostRequest } from '@/types'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: CreatePostRequest) => Promise<unknown>
  subjects?: SubjectResponse[]
}

export function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
  subjects = [],
}: Readonly<CreatePostModalProps>) {
  const [content, setContent] = useState('')
  const [subjectId, setSubjectId] = useState<string>('')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'FRIENDS' | 'ONLY_ME'>('PUBLIC')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ content?: string }>({})

  async function handleSubmit() {
    if (!content.trim()) {
      setErrors({ content: 'Vui lòng nhập nội dung bài viết thảo luận' })
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        content: content.trim(),
        visibility,
        post_type: 'SOCIAL_POST',
        subject_id: subjectId ? Number(subjectId) : undefined,
      })
      setContent('')
      setSubjectId('')
      setErrors({})
      onClose()
    } catch {
      // Error handled in hook toast
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    if (!loading) {
      setErrors({})
      onClose()
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="Tạo bài viết thảo luận mới"
      size="xl"
    >
      <Form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Subject & Visibility Selectors Row */}
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Grid layout container for form dropdowns] */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Học phần liên quan">
            <Select aria-label="Học phần liên quan" value={subjectId} onValueChange={(val) => setSubjectId(val)}>
              <SelectTrigger aria-label="Chọn học phần liên quan" className="min-h-11">
                <SelectValue placeholder="Chọn học phần (Tùy chọn)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- Không chọn học phần --</SelectItem>
                {subjects.map((sub) => (
                  <SelectItem key={sub.subject_id} value={String(sub.subject_id)}>
                    {sub.code} - {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Quyền riêng tư">
            <Select
              aria-label="Quyền riêng tư"
              value={visibility}
              onValueChange={(val) => setVisibility(val as 'PUBLIC' | 'FRIENDS' | 'ONLY_ME')}
            >
              <SelectTrigger aria-label="Chọn quyền riêng tư" className="min-h-11">
                <SelectValue placeholder="Chọn quyền riêng tư" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">Công khai (Toàn trường)</SelectItem>
                <SelectItem value="FRIENDS">Chỉ bạn bè HUST</SelectItem>
                <SelectItem value="ONLY_ME">Chỉ mình tôi</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        {/* Content Field */}
        <FormField
          label="Nội dung thảo luận"
          error={errors.content}
          required
        >
          <Textarea
            aria-label="Nội dung bài viết"
            placeholder="Chia sẻ câu hỏi ôn tập, thắc mắc bài giảng hoặc đề thi thử..."
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              if (errors.content) setErrors({})
            }}
            rows={5}
            maxLength={2000}
            className="text-sm"
          />
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Character counter layout] */}
          <div className="flex justify-end mt-1">
            <Text size="xs" tone="muted">
              {content.length}/2000 ký tự
            </Text>
          </div>
        </FormField>

        {/* Action Buttons */}
        <footer className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="min-h-11"
          >
            Hủy bỏ
          </Button>
          <SubmitButton
            loading={loading}
            variant="primary"
            className="min-h-11 px-6"
          >
            Đăng bài viết
          </SubmitButton>
        </footer>
      </Form>
    </Modal>
  )
}
