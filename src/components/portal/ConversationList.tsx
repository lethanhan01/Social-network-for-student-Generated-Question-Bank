import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, MessageCircle, Users, Plus } from 'lucide-react'
import { Button } from '@/components/ui/actions/Button'
import { Input } from '@/components/ui/forms/Input'
import { Avatar } from '@/components/ui/data-display/Avatar'
import { EmptyState } from '@/components/ui/feedback/EmptyState'
import { QueryFeedback } from './QueryFeedback'
import { formatTime } from '@/utils/date'
import { cn } from '@/utils/cn'
import type { ConversationDto } from '@/types'

interface Props {
  onNew?: () => void
  items: ConversationDto[]
  selected: number
  onSelect: (id: number) => void
  loading: boolean
  error: unknown
  retry: () => void
  hasMore: boolean
  loadingMore: boolean
  loadMore: () => void
}
export function ConversationList({
  onNew,
  items,
  selected,
  onSelect,
  loading,
  error,
  retry,
  hasMore,
  loadingMore,
  loadMore,
}: Props) {
  const { t } = useTranslation('portal')
  const [keyword, setKeyword] = useState('')
  const filtered = items.filter(
    (item) => item.display_name?.toLocaleLowerCase().includes(keyword.toLocaleLowerCase()) || !keyword
  )
  return (
    <aside
      className={cn('portal-conversations', selected > 0 ? 'hidden md:flex' : 'flex')}
      aria-label={t('messages.conversations')}
    >
      <header className="p-4 border-b border-line-subtle space-y-3">
        <section className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{t('messages.conversations')}</h2>
          {onNew ? (
            <Button variant="ghost" className="min-h-11 min-w-11" aria-label={t('messages.new')} onClick={onNew}>
              <Plus size={18} />
            </Button>
          ) : null}
        </section>
        <Input
          aria-label={t('messages.search')}
          placeholder={t('messages.search')}
          leadingIcon={<Search size={18} />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </header>
      <section className="flex-1 overflow-y-auto p-2 space-y-1">
        <QueryFeedback loading={loading} error={error} retry={retry} />
        {!loading && !error && filtered.length === 0 ? (
          <EmptyState
            icon={<MessageCircle />}
            title={t('messages.empty')}
            description={t('messages.emptyDescription')}
          />
        ) : null}
        {filtered.map((item) => (
          <Button
            key={item.conversation_id}
            variant="ghost"
            aria-pressed={selected === item.conversation_id}
            disabled={!item.conversation_id}
            onClick={() => onSelect(item.conversation_id ?? 0)}
            className={cn(
              'portal-conversation',
              selected === item.conversation_id ? 'bg-action-accent-soft border-line-accent-subtle' : ''
            )}
          >
            <Avatar src={item.display_avatar_url} name={item.display_name} size="md" />
            <section className="min-w-0 flex-1 text-left space-y-1">
              <h3 className="truncate text-sm font-semibold">{item.display_name || t('messages.untitled')}</h3>
              <p className="truncate text-xs text-fg-secondary">
                {item.last_message?.content || t('messages.noMessages')}
              </p>
            </section>
            <section className="shrink-0 text-right space-y-1">
              <p className="text-xs text-fg-muted">{formatTime(item.updated_at)}</p>
              {(item.unread_count ?? 0) > 0 ? (
                <strong className="rounded-full bg-action-accent px-2 py-1 text-xs text-text-inverse">
                  {item.unread_count}
                </strong>
              ) : item.type === 'GROUP' ? (
                <Users size={14} className="text-fg-secondary" />
              ) : null}
            </section>
          </Button>
        ))}
        {hasMore ? (
          <Button variant="ghost" className="w-full min-h-11" loading={loadingMore} onClick={loadMore}>
            {t('more')}
          </Button>
        ) : null}
      </section>
    </aside>
  )
}
