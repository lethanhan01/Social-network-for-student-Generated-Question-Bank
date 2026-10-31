import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, FormField, FileUpload } from '@/components/ui/forms'
import { SubmitButton } from '@/components/ui/actions/SubmitButton'
import { usePortalMutation } from '@/hooks/queries/usePortalQuery'
import { uploadSingleMedia } from '@/services/media-upload.service'
import { chatService } from '@/services/chat.service'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'

export function GroupAvatarForm({ conversationId }: { conversationId: number }) {
  const { t } = useTranslation('portal')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const mutation = usePortalMutation(async (image: File) => {
    const media = await uploadSingleMedia(image, 'AVATAR')
    if (!media.url) throw new Error(t('error'))
    return chatService.updateGroupInfo(conversationId, { avatar_url: media.url })
  })
  async function handleSubmit() {
    if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 4 * 1024 * 1024) {
      setError(t('group.imageInvalid'))
      return
    }
    try {
      await mutation.mutateAsync(file)
      setFile(null)
      toast.success(t('saved'))
    } catch (cause) {
      setError(getApiError(cause, t('error')))
    }
  }
  return (
    <Form noValidate aria-label={t('group.avatar')} className="space-y-3" onSubmit={() => void handleSubmit()}>
      <FormField label={t('group.avatar')} error={error}>
        <FileUpload
          value={file}
          onChange={(value) => {
            setFile(value)
            setError('')
          }}
          accept="image/jpeg,image/png,image/webp"
          maxSizeMB={4}
          disabled={mutation.isPending}
          placeholder={t('group.chooseImage')}
          helperText={t('group.imageInvalid')}
        />
      </FormField>
      <SubmitButton variant="outline" disabled={!file} loading={mutation.isPending}>
        {t('group.avatar')}
      </SubmitButton>
    </Form>
  )
}
