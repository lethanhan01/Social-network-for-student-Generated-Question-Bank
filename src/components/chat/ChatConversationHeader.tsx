import type { MouseEventHandler } from 'react'
import { useTranslation } from 'react-i18next'
import { Info } from 'lucide-react'
import { Avatar, Badge } from '@/components/ui/data-display'
import { BackButton, Button } from '@/components/ui/actions'
import type { WsConnectionStatus } from '@/services/websocket.service'
import type { ConversationDto } from '@/types'

const statusBadge = {
  CONNECTED: { tone: 'success', key: 'connected', label: 'Đã kết nối' },
  CONNECTING: { tone: 'warning', key: 'reconnecting', label: 'Đang kết nối lại…' },
  DISCONNECTED: { tone: 'danger', key: 'disconnected', label: 'Mất kết nối' },
} as const

export function ChatConversationHeader({ conversation, status, onBack, detailsOpen, onToggleDetails }: Readonly<{
  conversation?: ConversationDto
  status: WsConnectionStatus
  onBack?: () => void
  detailsOpen: boolean
  onToggleDetails: MouseEventHandler<HTMLButtonElement>
}>) {
  const { t } = useTranslation('chat')
  const { t: tp } = useTranslation('portal')
  const badge = statusBadge[status] ?? statusBadge.DISCONNECTED
  const controls = detailsOpen ? 'conversation-details' : undefined

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-line-subtle bg-surface-card px-2 sm:px-3">
      <section className="flex min-w-0 items-center gap-1">
        {onBack ? <BackButton iconOnly onClick={onBack} className="min-h-11 min-w-11 md:hidden" /> : null}
        <Button variant="ghost" className="min-h-11 min-w-0 shrink justify-start gap-2 px-2"
          aria-expanded={detailsOpen} aria-controls={controls} onClick={onToggleDetails} truncate>
          <Avatar aria-hidden="true" src={conversation?.display_avatar_url} name={conversation?.display_name} size="sm" tone="accent" className="shrink-0" />
          <strong className="truncate text-sm">{conversation?.display_name || t('messengerTitle')}</strong>
        </Button>
      </section>
      <section className="flex shrink-0 items-center gap-1">
        <Badge tone={badge.tone} size="xs" className="hidden sm:inline-flex">{t(badge.key, badge.label)}</Badge>
        <Button variant="ghost" size="sm" className="min-h-11 min-w-11 px-2"
          aria-label={tp('messages.details')} aria-expanded={detailsOpen} aria-controls={controls} onClick={onToggleDetails}>
          <Info size={19} />
        </Button>
      </section>
    </header>
  )
}
