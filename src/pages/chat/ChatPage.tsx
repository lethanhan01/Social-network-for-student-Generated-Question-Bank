import { useState, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import { ChatConversationView } from '@/components/chat/ChatConversationView'
import { NewChatModal } from '@/components/chat/NewChatModal'
import { StartConversationPanel } from '@/components/chat/StartConversationPanel'
import { useChatRealtimeSync } from '@/hooks/queries/useChatQuery'
import { cn } from '@/utils/cn'

function validId(value: string | null | undefined) {
  return value && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : undefined
}

export default function ChatPage() {
  const { conversationId: conversationIdParam } = useParams<{ conversationId?: string }>()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { t } = useTranslation('chat')
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)

  const activeId = validId(conversationIdParam ?? params.get('conversation'))
  const targetId = activeId ? undefined : validId(params.get('userId'))
  const showConversation = Boolean(activeId || targetId)

  const { connectionStatus, typingUsers, sendTypingStatus } = useChatRealtimeSync(activeId)

  const handleSelectConversation = useCallback(
    (id: number) => {
      navigate(`/messages/${id}`)
    },
    [navigate]
  )

  const handleBackToList = useCallback(() => {
    navigate('/messages')
  }, [navigate])

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Chat page 2-column flex container] */
    <div className="flex-1 flex w-full h-full min-h-0 overflow-hidden bg-surface-base">
      {/* Left Sidebar: visible on desktop always; on mobile only when no conversation is active */}
      <aside className={cn(
        'h-full shrink-0 min-h-0 transition-all duration-200',
        showConversation ? 'hidden md:flex' : 'flex w-full md:w-auto'
      )} aria-label={t('conversationList')}>
        <ChatSidebar
          activeId={activeId}
          onSelectConversation={handleSelectConversation}
          onOpenNewChat={() => setIsNewChatOpen(true)}
        />
      </aside>

      {/* Right Conversation View: visible on desktop always; on mobile only when conversation is active */}
      <section className={cn(
        'flex-1 h-full min-w-0 min-h-0 flex flex-col transition-all duration-200',
        !showConversation ? 'hidden md:flex' : 'flex'
      )} aria-label={t('conversationContent')}>
        {targetId ? (
          <StartConversationPanel key={targetId} targetId={targetId} onCreated={handleSelectConversation} onBack={handleBackToList} />
        ) : (
          <ChatConversationView
            key={activeId ?? 'empty'}
            conversationId={activeId}
            onBackToList={handleBackToList}
            onOpenNewChat={() => setIsNewChatOpen(true)}
            connectionStatus={connectionStatus}
            typingUsers={typingUsers}
            onSendTyping={sendTypingStatus}
          />
        )}
      </section>

      {/* New Chat Modal */}
      <NewChatModal
        open={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onCreated={handleSelectConversation}
      />
    </div>
  )
}

