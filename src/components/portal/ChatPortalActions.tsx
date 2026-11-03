import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Settings, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/actions/Button'
import { useConversationsQuery } from '@/hooks/queries/useChatQuery'
import { usePortalMutation } from '@/hooks/queries/usePortalQuery'
import { chatService } from '@/services/chat.service'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import { GroupSettingsModal } from './GroupSettingsModal'

export function ChatPortalActions({ conversationId }: { conversationId: number }) {
  const { t } = useTranslation('portal')
  const navigate = useNavigate()
  const query = useConversationsQuery()
  const conversation = query.data?.items?.find((item) => item.conversation_id === conversationId)
  const [isGroupOpen, setIsGroupOpen] = useState(false)
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
      <nav
        aria-label={t('group.title')}
        className="flex shrink-0 flex-wrap justify-end gap-2 border-b border-line-subtle bg-surface-card px-4 py-2"
      >
        <Button variant="ghost" className="min-h-11" loading={hide.isPending} onClick={() => void handleHide()}>
          <EyeOff size={18} />
          {t('messages.hide')}
        </Button>
        {conversation?.type === 'GROUP' ? (
          <Button variant="outline" className="min-h-11" onClick={() => setIsGroupOpen(true)}>
            <Settings size={18} />
            {t('group.title')}
          </Button>
        ) : null}
      </nav>
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
