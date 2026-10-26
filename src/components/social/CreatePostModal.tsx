import { useState, useRef, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Image as ImageIcon, X } from 'lucide-react'
import { Modal } from '@/components/ui/overlay'
import {
  Form,
  FormField,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/forms'
import { Button, SubmitButton } from '@/components/ui/actions'
import { Text } from '@/components/ui/typography'
import { uploadMultipleMedia } from '@/services/media-upload.service'
import { toast } from '@/lib/toast'
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
  const { t } = useTranslation()
  const [content, setContent] = useState('')
  const [subjectId, setSubjectId] = useState<string>('')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'FRIENDS' | 'ONLY_ME'>('PUBLIC')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ content?: string }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return
    const newFiles = Array.from(e.target.files)
    setSelectedFiles((prev) => [...prev, ...newFiles])
    e.target.value = ''
  }

  function handleRemoveFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    if (!content.trim()) {
      setErrors({ content: t('feed.createPost.contentRequired', 'Vui lòng nhập nội dung bài viết thảo luận') })
      return
    }

    setLoading(true)
    try {
      let media_urls
      if (selectedFiles.length > 0) {
        media_urls = await uploadMultipleMedia(selectedFiles, 'POST')
      }

      await onSubmit({
        content: content.trim(),
        visibility,
        post_type: 'SOCIAL_POST',
        subject_id: subjectId ? Number(subjectId) : undefined,
        media_urls,
      })

      setContent('')
      setSubjectId('')
      setSelectedFiles([])
      setErrors({})
      onClose()
    } catch {
      toast.error(t('feed.createPost.uploadFailed', 'Tải tệp đính kèm hoặc đăng bài thất bại. Vui lòng thử lại.'))
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
    <Modal open={isOpen} onClose={handleClose} title={t('feed.createPost.title', 'Tạo bài viết thảo luận mới')} size="xl">
      <Form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Grid layout container for form dropdowns] */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label={t('feed.createPost.subject', 'Học phần liên quan')}>
            <Select aria-label="Học phần liên quan" value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger aria-label="Chọn học phần liên quan" className="min-h-11">
                <SelectValue placeholder={t('feed.createPost.selectSubject', 'Chọn học phần (Tùy chọn)')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- {t('feed.createPost.noSubject', 'Không chọn học phần')} --</SelectItem>
                {subjects.map((sub) => (
                  <SelectItem key={sub.subject_id} value={String(sub.subject_id)}>
                    {sub.code} - {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label={t('feed.createPost.visibility', 'Quyền riêng tư')}>
            <Select
              aria-label="Quyền riêng tư"
              value={visibility}
              onValueChange={(val) => setVisibility(val as 'PUBLIC' | 'FRIENDS' | 'ONLY_ME')}
            >
              <SelectTrigger aria-label="Chọn quyền riêng tư" className="min-h-11">
                <SelectValue placeholder={t('feed.createPost.selectVisibility', 'Chọn quyền riêng tư')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">{t('feed.createPost.public', 'Công khai (Toàn trường)')}</SelectItem>
                <SelectItem value="FRIENDS">{t('feed.createPost.friends', 'Chỉ bạn bè HUST')}</SelectItem>
                <SelectItem value="ONLY_ME">{t('feed.createPost.onlyMe', 'Chỉ mình tôi')}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField label={t('feed.createPost.contentLabel', 'Nội dung thảo luận')} error={errors.content} required>
          <Textarea
            aria-label="Nội dung bài viết"
            placeholder={t('feed.createPost.placeholder', 'Chia sẻ câu hỏi ôn tập, thắc mắc bài giảng hoặc đề thi thử...')}
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
              {content.length}/2000 {t('feed.createPost.charCount', 'ký tự')}
            </Text>
          </div>
        </FormField>

        {/* Media Attachments Section */}
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Media attachment button & list wrapper] */}
        <div className="space-y-2">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Attach media trigger container] */}
          <div className="flex items-center gap-2">
            {/* rogym-convention-exempt: NO_RAW_FORM_ELEMENTS [Hidden native file input for media selection] */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*,video/*"
              className="hidden"
              aria-label={t('feed.createPost.addMedia', 'Đính kèm ảnh/video')}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}
              className="min-h-11 text-xs gap-1.5"
            >
              <ImageIcon size={16} />
              {t('feed.createPost.addMedia', 'Đính kèm ảnh/video')}
            </Button>
          </div>

          {selectedFiles.length > 0 ? (
            /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Attached file preview chips container] */
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedFiles.map((file, idx) => (
                /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Single file chip] */
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-raised border border-border text-xs"
                >
                  <Text size="xs" className="max-w-[140px] truncate">
                    {file.name}
                  </Text>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(idx)}
                    className="h-6 w-6 p-0 hover:bg-surface-elevated rounded-full"
                    aria-label={`Xóa file ${file.name}`}
                  >
                    <X size={12} />
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <footer className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="min-h-11">
            {t('common.cancel', 'Hủy bỏ')}
          </Button>
          <SubmitButton loading={loading} variant="primary" className="min-h-11 px-6">
            {t('feed.createPost.submit', 'Đăng bài viết')}
          </SubmitButton>
        </footer>
      </Form>
    </Modal>
  )
}
