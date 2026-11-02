import { useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/overlay/Modal'
import { Form } from '@/components/ui/forms/Form'
import { FormField } from '@/components/ui/forms/FormField'
import { Textarea } from '@/components/ui/forms/Textarea'
import { Select } from '@/components/ui/forms/Select'
import { Button } from '@/components/ui/actions/Button'
import { SubmitButton } from '@/components/ui/actions/SubmitButton'
import { useUpdatePostMutation } from '@/hooks/queries/usePostsQuery'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import { uploadMultipleMedia } from '@/services/media-upload.service'
import type { PostResponseDto, PostVisibility } from '@/types'

export function EditPostModal({
  post,
  onClose,
}: Readonly<{ post: PostResponseDto; onClose: () => void }>) {
  const { t } = useTranslation()
  const [content, setContent] = useState(post.content ?? '')
  const [media, setMedia] = useState(post.media_urls ?? [])
  const [files, setFiles] = useState<File[]>([])
  const fileInput = useRef<HTMLInputElement>(null)
  const [visibility, setVisibility] = useState<PostVisibility>(post.visibility ?? 'PUBLIC')
  const [error, setError] = useState('')
  const mutation = useUpdatePostMutation(post.post_id!)
  const [uploading, setUploading] = useState(false)
  const busy = uploading || mutation.isPending
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    if (!content.trim() && media.length === 0 && files.length === 0) {
      setError(t('social.contentRequired'))
      return
    }
    setUploading(true)
    try {
      const uploaded = files.length > 0 ? await uploadMultipleMedia(files, 'POST') : []
      await mutation.mutateAsync({
        content: content.trim(),
        visibility,
        media_urls: [...media, ...uploaded],
      })
      toast.success(t('social.postUpdated'))
      onClose()
    } catch (cause) {
      setError(getApiError(cause, t('zone2.actionError')))
    } finally {
      setUploading(false)
    }
  }
  return (
    <Modal
      open
      onClose={() => {
        if (!busy) onClose()
      }}
      title={t('social.editPost')}
    >
      <Form onSubmit={submit} noValidate onInput={() => setError('')} className="space-y-4">
        <fieldset disabled={busy} className="space-y-4">
          {/* rogym-convention-exempt: NO_RAW_FORM_ELEMENTS [Native file picker for replacing post attachments] */}
          <input
            ref={fileInput}
            type="file"
            multiple
            accept="image/*,video/*,application/pdf"
            className="hidden"
            aria-label={t('social.attachment')}
            onChange={(event) => {
              setFiles(Array.from(event.target.files ?? []))
              setError('')
            }}
          />
          <Button type="button" variant="outline" onClick={() => fileInput.current?.click()}>
            {t('social.attachment')}
            {files.length > 0 ? ` (${files.length})` : ''}
          </Button>
          <FormField label={t('feed.createPost.contentLabel')}>
            <Textarea
              value={content}
              rows={6}
              maxLength={2000}
              onChange={(event) => setContent(event.target.value)}
            />
          </FormField>
          <Select
            ariaLabel={t('feed.createPost.visibility')}
            value={visibility}
            clearable={false}
            onValueChange={(value) => setVisibility(value as PostVisibility)}
            options={(['PUBLIC', 'FRIENDS', 'ONLY_ME'] as const).map((value) => ({
              value,
              label: t(`social.visibility.${value}`),
            }))}
          />
          {media.map((item) => (
            <p
              key={item.key ?? item.url}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <strong className="truncate">{item.name ?? t('social.attachment')}</strong>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setMedia((previous) => previous.filter((entry) => entry !== item))}
              >
                {t('social.remove')}
              </Button>
            </p>
          ))}
        </fieldset>
        {error ? (
          <p role="alert" className="text-status-danger-fg">
            {error}
          </p>
        ) : null}
        <SubmitButton loading={busy}>{t('button.save')}</SubmitButton>
      </Form>
    </Modal>
  )
}
