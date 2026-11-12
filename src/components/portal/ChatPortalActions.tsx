import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Settings, EyeOff, Users, X } from 'lucide-react'
import { Button } from '@/components/ui/actions/Button'
import { Avatar } from '@/components/ui/data-display/Avatar'
import { useGroupMembersQuery, usePortalMutation } from '@/hooks/queries/usePortalQuery'
import { chatService } from '@/services/chat.service'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import type { ConversationDto } from '@/types'
import { GroupSettingsModal } from './GroupSettingsModal'
import { QueryFeedback } from './QueryFeedback'

export function ChatPortalActions({ conversationId, conversation, onClose }: Readonly<{
  conversationId: number
  conversation?: ConversationDto
  onClose: () => void
}>) {
  const { t } = useTranslation('portal')
  const navigate = useNavigate()
  const isGroup = conversation?.type === 'GROUP'
  const [isGroupOpen, setIsGroupOpen] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const members = useGroupMembersQuery(isGroup ? conversationId : 0)
  const count = members.data?.length ?? conversation?.member_count
  const name = conversation?.display_name || t('messages.untitled')
  const hide = usePortalMutation(() => chatService.hideConversation(conversationId))

  async function handleHide() {
    try {
      await hide.mutateAsync(undefined)
      navigate('/messages')
      toast.success(t('saved'))
    } catch (cause) {
      toast.error(getApiError(cause, t('error')))
    }
  }

  return (
    <>
      <header className="flex items-center justify-between gap-2 border-b border-line-subtle px-3 py-2">
        <h2 className="text-sm font-bold">{t('messages.details')}</h2>
        <Button variant="ghost" size="sm" className="min-h-11 min-w-11 px-2" onClick={onClose} aria-label={t('messages.closeDetails')}>
          <X size={18} />
        </Button>
      </header>
      <section className="grid justify-items-center gap-2 px-3 py-4 text-center">
        <Avatar src={conversation?.display_avatar_url} name={name} size="lg" tone="accent" />
        <h3 className="break-words text-base font-bold">{name}</h3>
        {conversation?.type ? <p className="text-sm text-fg-muted">{t(`messages.types.${conversation.type}`)}</p> : null}
      </section>
      <section className="space-y-1 border-t border-line-subtle p-2">
        {isGroup ? (
          <>
            <Button
              variant="ghost" size="sm" className="min-h-11 w-full justify-start gap-2"
              aria-expanded={showMembers} aria-controls={showMembers ? 'conversation-members' : undefined}
              onClick={() => setShowMembers((value) => !value)}
            >
              <Users size={18} />
              {count == null ? t('messages.memberList') : t('group.members', { count })}
            </Button>
            {showMembers ? (
              <section id="conversation-members" className="px-2">
                <QueryFeedback loading={members.isLoading} error={members.error} retry={() => void members.refetch()} />
                <ul className="divide-y divide-line-subtle">
                  {members.data?.map((member) => (
                    <li key={member.user_id} className="flex items-center gap-2 py-2">
                      <Avatar src={member.avatar_url} name={member.full_name} size="sm" />
                      <p className="min-w-0 truncate text-sm">{member.full_name}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            <Button variant="ghost" size="sm" className="min-h-11 w-full justify-start gap-2" onClick={() => setIsGroupOpen(true)}>
              <Settings size={18} /> {t('group.title')}
            </Button>
          </>
        ) : null}
        <Button variant="ghost" size="sm" className="min-h-11 w-full justify-start gap-2" loading={hide.isPending} onClick={() => void handleHide()}>
          <EyeOff size={18} /> {t('messages.hide')}
        </Button>
      </section>
      {isGroupOpen && conversation ? (
        <GroupSettingsModal
          conversation={conversation}
          onClose={() => setIsGroupOpen(false)}
          onLeft={() => navigate('/messages')}
        />
      ) : null}
    </>
  )
}
