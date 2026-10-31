import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Flag, Undo2 } from 'lucide-react'
import { Button, ButtonAnchor } from '@/components/ui/actions'
import { usePortalMutation } from '@/hooks/queries/usePortalQuery'
import { chatService } from '@/services/chat.service'
import { getApiError } from '@/lib/api-error'
import { formatDateTime } from '@/utils/date'
import { cn } from '@/utils/cn'
import type { MessageDto } from '@/types'

export function MessageBubble({
  message,
  userId,
  onReport,
}: {
  message: MessageDto
  userId: number
  onReport: (id: number) => void
}) {
  const { t } = useTranslation('portal')
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState('')
  const recall = usePortalMutation((mode: 'ME' | 'EVERYONE') =>
    chatService.recallMessage(message.message_id ?? 0, { mode })
  )
  async function handleRecall(mode: 'ME' | 'EVERYONE') {
    try {
      await recall.mutateAsync(mode)
      setConfirm(false)
    } catch (cause) {
      setError(getApiError(cause, t('error')))
    }
  }
  return (
    <article className={cn('portal-message', message.sender_id === userId ? 'portal-message-own' : '')}>
      <header className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold">{message.sender_name || t('messages.untitled')}</p>
        {message.sender_id && message.sender_id !== userId ? (
          <Button
            variant="ghost"
            size="sm"
            className="min-h-11 min-w-11"
            aria-label={t('report.title')}
            onClick={() => onReport(message.sender_id ?? 0)}
          >
            <Flag size={14} />
          </Button>
        ) : null}
        {message.message_id && !message.revoked ? (
          <Button
            variant="ghost"
            size="sm"
            className="min-h-11 min-w-11"
            aria-label={t('messages.recall')}
            onClick={() => setConfirm(!confirm)}
          >
            <Undo2 size={14} />
          </Button>
        ) : null}
      </header>
      <p className="whitespace-pre-wrap break-words text-sm">
        {message.revoked ? t('messages.recalled') : message.content}
      </p>
      {!message.revoked
        ? message.media_urls
            ?.filter((url) => /^https?:\/\//i.test(url))
            .map((url, index) => (
              <ButtonAnchor key={url} href={url} target="_blank" rel="noopener noreferrer" variant="link">
                {t('messages.attachment')} {index + 1}
              </ButtonAnchor>
            ))
        : null}
      <p className="mt-2 text-xs text-fg-secondary">{formatDateTime(message.created_at)}</p>
      {error ? (
        <p role="alert" className="text-sm text-status-danger-fg">
          {error}
        </p>
      ) : null}
      {confirm ? (
        <footer className="flex flex-wrap gap-2 pt-3">
          <Button variant="outline" disabled={recall.isPending} onClick={() => void handleRecall('ME')}>
            {t('messages.deleteMe')}
          </Button>
          {message.sender_id === userId ? (
            <Button variant="danger" disabled={recall.isPending} onClick={() => void handleRecall('EVERYONE')}>
              {t('messages.recall')}
            </Button>
          ) : null}
          <Button variant="ghost" disabled={recall.isPending} onClick={() => setConfirm(false)}>
            {t('cancel')}
          </Button>
        </footer>
      ) : null}
    </article>
  )
}
