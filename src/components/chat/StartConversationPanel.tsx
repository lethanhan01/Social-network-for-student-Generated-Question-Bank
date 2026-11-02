import { MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/actions/Button'
import { BackButton } from '@/components/ui/actions/BackButton'
import { EmptyState } from '@/components/ui/feedback/EmptyState'
import { useCreateDirectConversationMutation } from '@/hooks/queries/useChatQuery'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'

export function StartConversationPanel({ targetId, onCreated, onBack }: Readonly<{
  targetId: number
  onCreated: (id: number) => void
  onBack: () => void
}>) {
  const { t } = useTranslation()
  const create = useCreateDirectConversationMutation()
  async function start() {
    if (create.isPending) return
    try {
      const conversation = await create.mutateAsync({ target_user_id: targetId })
      if (!conversation.conversation_id) throw new Error(t('zone2.actionError'))
      onCreated(conversation.conversation_id)
    } catch (cause) {
      toast.error(getApiError(cause, t('zone2.actionError')))
    }
  }
  return (
    <section className="flex h-full min-h-0 flex-col bg-surface-base p-4">
      <BackButton onClick={onBack} className="md:hidden self-start min-h-11" />
      <section className="flex flex-1 items-center justify-center">
        <EmptyState
          icon={<MessageCircle size={48} className="text-action-accent" />}
          title={t('social.startConversation')}
          description={t('social.startConversationDescription')}
          action={<Button loading={create.isPending} onClick={() => { void start() }}>{t('social.startConversation')}</Button>}
        />
      </section>
    </section>
  )
}
