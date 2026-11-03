import { ChatPortalActions } from '@/components/portal/ChatPortalActions'
import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import { ChatConversationView } from '@/components/chat/ChatConversationView'
import { NewChatModal } from '@/components/chat/NewChatModal'
import { useChatRealtimeSync } from '@/hooks/queries/useChatQuery'
import { cn } from '@/utils/cn'

export default function ChatPage() {
  const { conversationId: conversationIdParam } = useParams<{ conversationId?: string }>()
  const navigate = useNavigate()
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)

  const activeId = conversationIdParam ? Number(conversationIdParam) : undefined

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
        activeId ? 'hidden md:flex' : 'flex w-full md:w-auto'
      )} aria-label="Danh sách cuộc trò chuyện">
        <ChatSidebar
          activeId={activeId}
          onSelectConversation={handleSelectConversation}
          onOpenNewChat={() => setIsNewChatOpen(true)}
        />
      </aside>

      {/* Right Conversation View: visible on desktop always; on mobile only when conversation is active */}
      <section className={cn(
        'flex-1 h-full min-w-0 min-h-0 flex flex-col transition-all duration-200',
        !activeId ? 'hidden md:flex' : 'flex'
      )} aria-label="Nội dung hội thoại">
        {activeId ? <ChatPortalActions key={activeId} conversationId={activeId} /> : null}
        <ChatConversationView
          conversationId={activeId}
          onBackToList={handleBackToList}
          onOpenNewChat={() => setIsNewChatOpen(true)}
          connectionStatus={connectionStatus}
          typingUsers={typingUsers}
          onSendTyping={sendTypingStatus}
        />
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

