import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/actions/Button'
import { useCreateDirectConversationMutation } from '@/hooks/queries/useChatQuery'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'

export function StartDirectConversation() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const raw = params.get('userId')
  const id = raw && /^[1-9]\d*$/.test(raw) && Number.isSafeInteger(Number(raw)) ? Number(raw) : 0
  const create = useCreateDirectConversationMutation()
  async function handleStart() {
    if (!id || create.isPending) return
    try {
      const conversation = await create.mutateAsync({ target_user_id: id })
      if (!conversation.conversation_id) throw new Error(t('zone2.actionError'))
      setParams({ conversation: String(conversation.conversation_id) })
    } catch (cause) {
      toast.error(getApiError(cause, t('zone2.actionError')))
    }
  }
  if (!id) return null
  return (
    <Button loading={create.isPending} onClick={() => void handleStart()}>
      {t('social.startConversation')}
    </Button>
  )
}
