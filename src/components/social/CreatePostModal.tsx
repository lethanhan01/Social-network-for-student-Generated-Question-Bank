import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/overlay/Modal'
import { Form } from '@/components/ui/forms/Form'
import { FormField } from '@/components/ui/forms/FormField'
import { Textarea } from '@/components/ui/forms/Textarea'
import { Select } from '@/components/ui/forms/Select'
import { Button } from '@/components/ui/actions/Button'
import { SubmitButton } from '@/components/ui/actions/SubmitButton'
import { uploadMultipleMedia } from '@/services/media-upload.service'
import { toast } from '@/lib/toast'
import { getApiError } from '@/lib/api-error'
import { PostAttachments } from './PostAttachments'
import type { SubjectResponse, CreatePostRequest, PostVisibility } from '@/types'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: CreatePostRequest) => Promise<unknown>
  subjects?: SubjectResponse[]
  authorRole?: string
}
export function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
  subjects = [],
  authorRole,
}: Readonly<CreatePostModalProps>) {
  const { t } = useTranslation()
  const [content, setContent] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [visibility, setVisibility] = useState<PostVisibility>('PUBLIC')
  const [postType, setPostType] = useState<'SOCIAL_POST' | 'LEARNING_VIDEO'>('SOCIAL_POST')
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    if (!content.trim() && files.length === 0) {
      setError(t('feed.createPost.contentRequired'))
      return
    }
    if (
      postType === 'LEARNING_VIDEO' &&
      (!subjectId || !files.some((file) => file.type.startsWith('video/')))
    ) {
      setError(t('social.videoRequired'))
      return
    }
    setBusy(true)
    try {
      const media_urls = files.length > 0 ? await uploadMultipleMedia(files, 'POST') : undefined
      await onSubmit({
        content: content.trim(),
        visibility,
        post_type: postType,
        subject_id: subjectId ? Number(subjectId) : undefined,
        media_urls,
      })
      toast.success(t('social.postCreated'))
      onClose()
    } catch (cause) {
      setError(getApiError(cause, t('feed.createPost.uploadFailed')))
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal
      open={isOpen}
      onClose={() => {
        if (!busy) onClose()
      }}
      title={t('feed.createPost.title')}
      size="xl"
    >
      <Form onSubmit={submit} noValidate onInput={() => setError('')} className="space-y-4">
        <fieldset disabled={busy} className="space-y-4">
          {authorRole === 'LECTURER' || authorRole === 'ADMIN' ? (
            <FormField label={t('social.postType')}>
              <Select
                ariaLabel={t('social.postType')}
                value={postType}
                disabled={busy}
                clearable={false}
                onValueChange={(value) => {
                  setPostType(value as typeof postType)
                  setError('')
                }}
                options={[
                  { value: 'SOCIAL_POST', label: t('social.discussion') },
                  { value: 'LEARNING_VIDEO', label: t('social.lectureVideo') },
                ]}
              />
            </FormField>
          ) : null}
          <FormField label={t('feed.createPost.subject')}>
            <Select
              ariaLabel={t('feed.createPost.selectSubject')}
              value={subjectId}
              disabled={busy}
              placeholder={t('feed.createPost.selectSubject')}
              onValueChange={(value) => {
                setSubjectId(value)
                setError('')
              }}
              options={subjects
                .filter((subject) => subject.subject_id)
                .map((subject) => ({
                  value: String(subject.subject_id),
                  label: `${subject.code} · ${subject.name}`,
                }))}
            />
          </FormField>
          <FormField label={t('feed.createPost.visibility')}>
            <Select
              ariaLabel={t('feed.createPost.selectVisibility')}
              value={visibility}
              disabled={busy}
              clearable={false}
              onValueChange={(value) => setVisibility(value as PostVisibility)}
              options={(['PUBLIC', 'FRIENDS', 'ONLY_ME'] as const).map((value) => ({
                value,
                label: t(`social.visibility.${value}`),
              }))}
            />
          </FormField>
          <FormField label={t('feed.createPost.contentLabel')} error={error}>
            <Textarea
              aria-label={t('social.postContentInput')}
              placeholder={t('feed.createPost.placeholder')}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={5}
              maxLength={2000}
            />
          </FormField>
          <PostAttachments
            files={files}
            disabled={busy}
            onChange={(next) => {
              setFiles(next)
              setError('')
            }}
          />
        </fieldset>
        <footer className="flex justify-end gap-3 border-t border-line-subtle pt-4">
          <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
            {t('button.cancel')}
          </Button>
          <SubmitButton loading={busy}>{t('feed.createPost.submit')}</SubmitButton>
        </footer>
      </Form>
    </Modal>
  )
}
