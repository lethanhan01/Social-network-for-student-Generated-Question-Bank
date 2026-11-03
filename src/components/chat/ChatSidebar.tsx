import { ButtonLink } from '@/components/ui/actions/Button'
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
import { useConversationsQuery } from '@/hooks/queries/useChatQuery'
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

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diffSec < 60) return 'Vừa xong'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} phút`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} giờ`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay} ngày`
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date)
}

export function ChatSidebar({ activeId, onSelectConversation, onOpenNewChat }: Readonly<ChatSidebarProps>) {
  const { t } = useTranslation('chat')
  const { t: tp } = useTranslation('portal')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'ALL' | 'UNREAD' | 'GROUP'>('ALL')

  const { data: convData } = useConversationsQuery()
  const conversations = useMemo(() => convData?.items ?? [], [convData?.items])

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (tab === 'UNREAD' && (!c.unread_count || c.unread_count === 0)) return false
      if (tab === 'GROUP' && c.type !== 'GROUP') return false
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        return (c.display_name || '').toLowerCase().includes(q) || (c.last_message?.content || '').toLowerCase().includes(q)
      }
      return true
    })
  }, [conversations, tab, search])

  function renderSnippet(c: ConversationDto) {
    if (!c.last_message) return t('noMessagesShort', 'Chưa có tin nhắn')
    if (c.last_message.message_type === 'IMAGE') {
      return t('sentImage', 'đã gửi một ảnh')
    }
    return c.last_message.content || ''
  }

  return (
    <aside aria-label={t('messengerTitle', 'Đoạn chat')} className="w-full md:w-80 lg:w-96 flex flex-col h-full bg-surface-card border-r border-line-subtle shrink-0">
      <nav className="shrink-0 px-3 pt-3"><ButtonLink to="/messages/hidden-vault" variant="outline" className="min-h-11 w-full">{tp('vault.title')}</ButtonLink></nav>
      <header className="p-3 pb-2 flex items-center justify-between gap-2 shrink-0">
        <Heading as="h1" size="lg" className="font-bold text-fg-primary tracking-tight">
          {t('messengerTitle', 'Đoạn chat')}
        </Heading>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Header actions flex buttons row] */}
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label={t('options', 'Tùy chọn')} className="w-9 h-9 p-0 rounded-full text-fg-muted hover:text-fg-primary">
                <MoreHorizontal size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1 bg-surface-elevated border border-line-subtle rounded-xl z-50">
              <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-card-hover cursor-pointer">
                <CheckCheck size={16} />
                <span>{t('markAllAsRead', 'Đánh dấu tất cả là đã đọc')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" onClick={onOpenNewChat} aria-label={t('newMessage', 'Tạo đoạn chat mới')} className="w-9 h-9 p-0 rounded-full text-fg-muted hover:text-fg-primary">
            <SquarePen size={18} />
          </Button>
        </div>
      </header>

      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Search bar wrapper padding] */}
      <div className="px-3 py-1.5 shrink-0">
        <SearchInput value={search} onChange={setSearch} placeholder={t('searchMessenger', 'Tìm kiếm trên Messenger')} aria-label={t('searchMessenger', 'Tìm kiếm trên Messenger')} className="rounded-full bg-surface-sunken" />
      </div>

      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Tabs pill wrapper] */}
      <div className="px-3 py-1.5 shrink-0">
        <SegmentedControl
          value={tab}
          onValueChange={(val) => setTab(val as 'ALL' | 'UNREAD' | 'GROUP')}
          options={[
            { value: 'ALL', label: t('filterAll', 'Tất cả') },
            { value: 'UNREAD', label: t('filterUnread', 'Chưa đọc') },
            { value: 'GROUP', label: t('filterGroups', 'Nhóm') },
          ]}
        />
      </div>

      <nav aria-label="Danh sách đoạn chat" className="flex-1 overflow-y-auto px-2 divide-y divide-line-subtle/20">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((c) => {
            const cid = c.conversation_id ?? 0
            const isActive = activeId === cid
            const hasUnread = (c.unread_count ?? 0) > 0
            const name = c.display_name || 'Đoạn chat'
            const initials = name.trim().charAt(0).toUpperCase()
            const timeAgo = formatRelativeTime(c.last_message?.created_at || c.updated_at)

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
                    <Badge tone="success" className="absolute bottom-0 right-0 w-3 h-3 p-0 rounded-full border-2 border-surface-card" />
                  </div>
                  {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Text snippet stack] */}
                  <div className="min-w-0 flex-1">
                    {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Chat title row] */}
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('text-sm truncate', hasUnread ? 'font-bold text-fg-primary' : 'font-medium text-fg-primary')}>{name}</p>
                      {timeAgo ? <span className={cn('text-[11px] shrink-0', hasUnread ? 'font-semibold text-action-accent' : 'text-fg-muted')}>{timeAgo}</span> : null}
                    </div>
                    {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Snippet and unread status row] */}
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className={cn('text-xs truncate', hasUnread ? 'font-semibold text-fg-primary' : 'text-fg-muted')}>{renderSnippet(c)}</p>
                      {renderStatusIndicator(hasUnread, c.muted)}
                    </div>
                  </div>
                </div>
              </Button>
            )
          })
        ) : (
          <p className="p-8 text-center text-sm text-fg-muted">{t('noConversations', 'Chưa có cuộc trò chuyện nào')}</p>
        )}
      </nav>
    </aside>
  )
}
