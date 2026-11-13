import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GraduationCap } from 'lucide-react'
import { Modal } from '@/components/ui/overlay'
import { Form, FormField, Textarea } from '@/components/ui/forms'
import { Button, SubmitButton } from '@/components/ui/actions'
import { Text } from '@/components/ui/typography'
import { useUpdateLecturerNoteMutation } from '@/hooks/queries/usePostsQuery'
import { toast } from '@/lib/toast'

interface LecturerNoteModalProps {
  isOpen: boolean
  postId: number
  initialNote?: string | null
  onClose: () => void
}

export function LecturerNoteModal({
  isOpen,
  postId,
  initialNote,
  onClose,
}: Readonly<LecturerNoteModalProps>) {
  const { t } = useTranslation()
  const [note, setNote] = useState(initialNote ?? '')
  const [error, setError] = useState<string | undefined>()

  const updateNoteMutation = useUpdateLecturerNoteMutation(postId)

  async function handleSubmit() {
    if (!note.trim()) {
      setError(t('post.lecturerNote.required'))
      return
    }

    try {
      await updateNoteMutation.mutateAsync({ content: note.trim() })
      toast.success(t('post.lecturerNote.success'))
      onClose()
    } catch {
      toast.error(t('post.lecturerNote.error'))
    }
  }

  function handleClose() {
    if (!updateNoteMutation.isPending) {
      setError(undefined)
      onClose()
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={t('post.lecturerNote.title')}
      size="md"
    >
      <Form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Information callout container] */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs">
          <GraduationCap size={18} className="shrink-0 mt-0.5" />
          <Text size="xs" className="leading-relaxed">
            {t('post.lecturerNote.guideline')}
          </Text>
        </div>

        <FormField
          label={t('post.lecturerNote.contentLabel')}
          error={error}
          required
        >
          <Textarea
            aria-label="Nội dung nhận xét chuyên môn"
            placeholder={t('post.lecturerNote.placeholder')}
            value={note}
            onChange={(e) => {
              setNote(e.target.value)
              if (error) setError(undefined)
            }}
            rows={4}
            maxLength={1000}
            className="text-sm"
          />
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Char count container] */}
          <div className="flex justify-end mt-1">
            <Text size="xs" tone="muted">
              {note.length}/1000 {t('feed.createPost.charCount')}
            </Text>
          </div>
        </FormField>

        <footer className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={updateNoteMutation.isPending}
            className="min-h-11"
          >
            {t('common.cancel')}
          </Button>
          <SubmitButton
            loading={updateNoteMutation.isPending}
            variant="primary"
            className="min-h-11 px-5"
          >
            {t('post.lecturerNote.save')}
          </SubmitButton>
        </footer>
      </Form>
    </Modal>
  )
}
