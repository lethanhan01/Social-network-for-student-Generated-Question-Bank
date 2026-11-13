import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SquarePen, MoreHorizontal, BellOff, CheckCheck } from 'lucide-react'
import { Heading } from '@/components/ui/typography/Heading'
import { SearchInput } from '@/components/ui/forms/SearchInput'
import { Avatar } from '@/components/ui/data-display/Avatar'
import { Badge } from '@/components/ui/data-display/Badge'
import { Button } from '@/components/ui/actions/Button'
import { SegmentedControl } from '@/components/ui/navigation/SegmentedControl'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/overlay'
import { useInfiniteConversationsQuery } from '@/hooks/queries/useMessengerQuery'
import { QueryFeedback } from '@/components/social/QueryFeedback'
import { LoadMore } from '@/components/social/LoadMore'
import { formatDateTime } from '@/utils/date'
import type { ConversationDto } from '@/types'
import { cn } from '@/utils/cn'

interface ChatSidebarProps {
  activeId?: number
  onSelectConversation: (id: number) => void
  onOpenNewChat: () => void
}

function renderStatusIndicator(hasUnread: boolean, isMuted?: boolean) {
  if (hasUnread) {
    return <Badge tone="accent" className="w-2.5 h-2.5 p-0 rounded-full shrink-0" />
  }
  if (isMuted) {
    return <BellOff size={13} className="text-fg-muted shrink-0" />
  }
  return null
}

export function ChatSidebar({ activeId, onSelectConversation, onOpenNewChat }: Readonly<ChatSidebarProps>) {
  const { t } = useTranslation('chat')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'ALL' | 'UNREAD' | 'GROUP'>('ALL')

  const query = useInfiniteConversationsQuery()

  const filteredConversations = useMemo(() => {
    const conversations = query.data?.pages.flatMap((page) => page.items ?? []) ?? []
    return conversations.filter((c) => {
      if (tab === 'UNREAD' && (!c.unread_count || c.unread_count === 0)) return false
      if (tab === 'GROUP' && c.type !== 'GROUP') return false
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        return (c.display_name || '').toLowerCase().includes(q) || (c.last_message?.content || '').toLowerCase().includes(q)
      }
      return true
    })
  }, [query.data, tab, search])

  function renderSnippet(c: ConversationDto) {
    if (!c.last_message) return t('noMessagesShort')
    if (c.last_message.message_type === 'IMAGE') {
      return t('sentImage')
    }
    return c.last_message.content || ''
  }

  return (
    <aside aria-label={t('messengerTitle')} className="w-full md:w-64 xl:w-72 flex flex-col h-full bg-surface-card border-r border-line-subtle shrink-0">
      <header className="p-3 pb-2 flex items-center justify-between gap-2 shrink-0">
        <Heading level={1} className="text-xl font-bold text-fg-primary tracking-tight">
          {t('messengerTitle')}
        </Heading>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Header actions flex buttons row] */}
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label={t('options')} className="w-9 h-9 p-0 rounded-full text-fg-muted hover:text-fg-primary">
                <MoreHorizontal size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1 bg-surface-elevated border border-line-subtle rounded-xl z-50">
              <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-card-hover cursor-pointer">
                <CheckCheck size={16} />
                <span>{t('markAllAsRead')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" onClick={onOpenNewChat} aria-label={t('newMessage')} className="w-9 h-9 p-0 rounded-full text-fg-muted hover:text-fg-primary">
            <SquarePen size={18} />
          </Button>
        </div>
      </header>

      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Search bar wrapper padding] */}
      <div className="px-3 py-1.5 shrink-0">
        <SearchInput value={search} onChange={setSearch} placeholder={t('searchMessenger')} aria-label={t('searchMessenger')} className="rounded-full bg-surface-sunken" />
      </div>

      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Tabs pill wrapper] */}
      <div className="px-3 py-1.5 shrink-0">
        <SegmentedControl
          value={tab}
          onValueChange={(val) => setTab(val as 'ALL' | 'UNREAD' | 'GROUP')}
          options={[
            { value: 'ALL', label: t('filterAll') },
            { value: 'UNREAD', label: t('filterUnread') },
            { value: 'GROUP', label: t('filterGroups') },
          ]}
        />
      </div>

      <nav aria-label={t('conversationList')} className="flex-1 overflow-y-auto px-2 divide-y divide-line-subtle/20">
        {query.isPending || (query.isError && !query.data) ? (
          <QueryFeedback pending={query.isPending} error={query.error} onRetry={query.refetch} />
        ) : null}
        {filteredConversations.length > 0 ? (
          filteredConversations.map((c) => {
            const cid = c.conversation_id ?? 0
            const isActive = activeId === cid
            const hasUnread = (c.unread_count ?? 0) > 0
            const name = c.display_name || 'Đoạn chat'
            const initials = name.trim().charAt(0).toUpperCase()
            const timestamp = c.last_message?.created_at || c.updated_at

            return (
              <Button
                key={cid}
                variant="ghost"
                onClick={() => onSelectConversation(cid)}
                className={cn(
                  'w-full flex items-center justify-between gap-3 p-2.5 rounded-xl text-left min-h-16 h-auto transition-colors my-0.5',
                  isActive ? 'bg-surface-card-hover border-line-accent-subtle shadow-xs' : 'hover:bg-surface-card-hover'
                )}
              >
                {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Avatar and chat preview container] */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Avatar relative wrap for online dot] */}
                  <div className="relative shrink-0">
                    <Avatar src={c.display_avatar_url ?? undefined} name={name} fallback={initials} size="md" tone="accent" />
                  </div>
                  {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Text snippet stack] */}
                  <div className="min-w-0 flex-1">
                    {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Chat title row] */}
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('text-sm truncate', hasUnread ? 'font-bold text-fg-primary' : 'font-medium text-fg-primary')}>{name}</p>
                    </div>
                    {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Snippet and unread status row] */}
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className={cn('text-xs truncate', hasUnread ? 'font-semibold text-fg-primary' : 'text-fg-muted')}>{renderSnippet(c)}</p>
                      {renderStatusIndicator(hasUnread, c.muted)}
                    </div>
                    {timestamp ? <time dateTime={timestamp} className="text-xs text-fg-muted">{formatDateTime(timestamp)}</time> : null}
                  </div>
                </div>
              </Button>
            )
          })
        ) : (
          query.isSuccess ? <p className="p-8 text-center text-sm text-fg-muted">{t('noConversations')}</p> : null
        )}
        <LoadMore query={query} />
      </nav>
    </aside>
  )
}
