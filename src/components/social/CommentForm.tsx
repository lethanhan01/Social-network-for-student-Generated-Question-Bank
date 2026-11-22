import { useRef, useState, type SubmitEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Camera, SendHorizontal } from 'lucide-react'
import { Avatar } from '@/components/ui/data-display/Avatar'
import { Form } from '@/components/ui/forms/Form'
import { FormField } from '@/components/ui/forms/FormField'
import { Input } from '@/components/ui/forms/Input'
import { Button } from '@/components/ui/actions/Button'
import { SubmitButton } from '@/components/ui/actions/SubmitButton'
import { uploadSingleMedia } from '@/services/media-upload.service'
import { getApiError } from '@/lib/api-error'

export function CommentForm({
  initial = '',
  label,
  avatarUrl,
  avatarName,
  onSend,
  onCancel,
}: Readonly<{
  initial?: string
  label: string
  avatarUrl?: string
  avatarName?: string
  onSend: (text: string, media?: string) => Promise<unknown>
  onCancel?: () => void
}>) {
  const { t } = useTranslation()
  const [text, setText] = useState(initial)
  const [file, setFile] = useState<File>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || (!text.trim() && !file)) return
    setBusy(true)
    try {
      const media = file ? await uploadSingleMedia(file, 'COMMENT') : undefined
      await onSend(text.trim(), media?.url)
      setText('')
      setFile(undefined)
    } catch (cause) {
      setError(getApiError(cause, t('zone2.actionError')))
    } finally {
      setBusy(false)
    }
  }
  return (
    <Form
      onSubmit={submit}
      noValidate
      className="flex items-start gap-2.5"
      onInput={() => setError('')}
    >
      {avatarName || avatarUrl ? (
        <Avatar
          name={avatarName || t('social.member')}
          src={avatarUrl || undefined}
          size="md"
          className="mt-0.5 shrink-0"
        />
      ) : null}
      <FormField error={error} className="min-w-0 flex-1">
        <fieldset className="space-y-1 rounded-2xl border border-line-subtle bg-surface-hover px-3 py-1.5 transition-all duration-150 focus-within:border-action-primary focus-within:ring-2 focus-within:ring-focus-ring focus-within:ring-offset-1">
          <Input
            value={text}
            disabled={busy}
            aria-label={label}
            placeholder={`${label}...`}
            onChange={(event) => setText(event.target.value)}
            maxLength={2000}
            size="sm"
            className="h-8 min-h-0 rounded-none border-0 bg-transparent px-0 shadow-none focus-within:border-transparent focus-within:ring-0 focus-within:ring-offset-0"
            inputClassName="focus-visible:outline-hidden"
          />
          <footer className="flex flex-wrap items-center gap-1.5">
            {/* rogym-convention-exempt: NO_RAW_FORM_ELEMENTS [Native file selection for comment attachments] */}
            <input
              ref={input}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label={t('social.attachment')}
              onChange={(event) => {
                setFile(event.target.files?.[0])
                setError('')
                event.target.value = ''
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="xs"
              disabled={busy}
              aria-label={t('social.attachment')}
              leftIcon={<Camera size={16} />}
              onClick={() => input.current?.click()}
              className="px-1.5 text-text-muted"
            />
            {file ? (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                disabled={busy}
                onClick={() => setFile(undefined)}
              >
                {file.name} · {t('social.remove')}
              </Button>
            ) : null}
            {onCancel ? (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                disabled={busy}
                onClick={onCancel}
                className="ml-auto"
              >
                {t('button.cancel')}
              </Button>
            ) : null}
            <SubmitButton
              variant="ghost"
              size="xs"
              aria-label={t('button.submit')}
              leftIcon={<SendHorizontal size={16} />}
              loading={busy}
              disabled={!text.trim() && !file}
              className={onCancel ? 'px-1.5 text-action-primary' : 'ml-auto px-1.5 text-action-primary'}
            >
              {null}
            </SubmitButton>
          </footer>
        </fieldset>
      </FormField>
    </Form>
  )
}
