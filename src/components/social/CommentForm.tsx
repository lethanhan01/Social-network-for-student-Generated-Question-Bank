import { useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
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
  onSend,
  onCancel,
}: Readonly<{
  initial?: string
  label: string
  onSend: (text: string, media?: string) => Promise<unknown>
  onCancel?: () => void
}>) {
  const { t } = useTranslation()
  const [text, setText] = useState(initial)
  const [file, setFile] = useState<File>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)
  async function submit(event: FormEvent) {
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
    <Form onSubmit={submit} noValidate className="space-y-2" onInput={() => setError('')}>
      <FormField label={label} error={error}>
        <Input
          value={text}
          disabled={busy}
          onChange={(event) => setText(event.target.value)}
          maxLength={2000}
        />
      </FormField>
      <footer className="flex flex-wrap items-center gap-2">
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
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          {t('social.attachment')}
        </Button>
        {file ? (
          <Button type="button" variant="ghost" disabled={busy} onClick={() => setFile(undefined)}>
            {file.name} · {t('social.remove')}
          </Button>
        ) : null}
        {onCancel ? (
          <Button type="button" variant="ghost" disabled={busy} onClick={onCancel}>
            {t('button.cancel')}
          </Button>
        ) : null}
        <SubmitButton loading={busy} disabled={!text.trim() && !file}>
          {t('button.submit')}
        </SubmitButton>
      </footer>
    </Form>
  )
}
