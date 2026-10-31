import { GroupAvatarForm } from './GroupAvatarForm'
import { GroupMembers } from './GroupMembers'
import type { GroupAction } from './group.types'
import { UserPicker, type PickedUser } from './UserPicker'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LogOut } from 'lucide-react'
import { PortalDialog } from './PortalDialog'
import { QueryFeedback } from './QueryFeedback'
import { Button } from '@/components/ui/actions/Button'
import { SubmitButton } from '@/components/ui/actions/SubmitButton'
import { Form, FormField, Input, Select } from '@/components/ui/forms'
import { useGroupMembersQuery, usePortalMutation } from '@/hooks/queries/usePortalQuery'
import { chatService } from '@/services/chat.service'
import { useAuthStore } from '@/stores/authStore'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import { groupNameSchema } from './portal.schemas'
import type { ConversationDto } from '@/types'

export function GroupSettingsModal({
  conversation,
  onClose,
  onLeft,
}: {
  conversation: ConversationDto
  onClose: () => void
  onLeft: () => void
}) {
  const { t } = useTranslation('portal')
  const id = conversation.conversation_id ?? 0
  const members = useGroupMembersQuery(id)
  const userId = useAuthStore((s) => Number(s.user?.user_id ?? s.user?.userId))
  const me = members.data?.find((member) => member.user_id === userId)
  const canManage = me?.role === 'CHIEF' || me?.role === 'VILLAGE_ELDER'
  const [name, setName] = useState(conversation.display_name ?? '')
  const [invitees, setInvitees] = useState<PickedUser[]>([])
  const [successor, setSuccessor] = useState('')
  const [action, setAction] = useState<GroupAction | null>(null)
  const [error, setError] = useState('')
  const update = usePortalMutation((value: string) => chatService.updateGroupInfo(id, { name: value }))
  const invite = usePortalMutation((ids: number[]) => chatService.addGroupMembers(id, { user_ids: ids }))
  const perform = usePortalMutation(async (value: GroupAction) => {
    if (value.kind === 'remove') return chatService.removeGroupMember(id, value.userId)
    if (value.kind === 'role') return chatService.updateMemberRole(id, value.userId, { role: value.role })
    return chatService.leaveGroup(id, successor ? { new_chief_id: Number(successor) } : undefined)
  })
  const busy = update.isPending || invite.isPending || perform.isPending
  async function handleRename() {
    const parsed = groupNameSchema.safeParse(name)
    if (!parsed.success) {
      setError(t('group.invalidName'))
      return
    }
    try {
      await update.mutateAsync(parsed.data)
      toast.success(t('saved'))
    } catch (cause) {
      setError(getApiError(cause, t('error')))
    }
  }
  async function handleInvite() {
    if (invitees.length === 0) {
      setError(t('group.chooseMembers'))
      return
    }
    try {
      const result = await invite.mutateAsync(invitees.map((user) => user.id))
      if (result.failed_members?.length) {
        setError(
          result.failed_members.map((member) => member.full_name || t('group.add')).join(', ') +
            ': ' +
            t('group.inviteFailed')
        )
        return
      }
      setInvitees([])
      toast.success(t('group.inviteResult'))
    } catch (cause) {
      setError(getApiError(cause, t('error')))
    }
  }
  async function handleConfirm() {
    if (!action) return
    try {
      await perform.mutateAsync(action)
      if (action.kind === 'leave') {
        onLeft()
        return
      }
      setAction(null)
      toast.success(t('saved'))
    } catch (cause) {
      setError(getApiError(cause, t('error')))
    }
  }
  return (
    <PortalDialog
      drawer
      title={t('group.title')}
      description={t('group.description')}
      onClose={() => {
        if (!busy) onClose()
      }}
    >
      <QueryFeedback loading={members.isLoading} error={members.error} retry={() => void members.refetch()} />
      {error ? (
        <p role="alert" className="text-sm text-status-danger-fg">
          {error}
        </p>
      ) : null}
      {canManage ? (
        <Form noValidate aria-label={t('group.rename')} className="space-y-3" onSubmit={() => void handleRename()}>
          <FormField label={t('group.name')}>
            <Input
              aria-label={t('group.name')}
              value={name}
              maxLength={100}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
            />
          </FormField>
          <SubmitButton loading={update.isPending} disabled={busy}>
            {t('save')}
          </SubmitButton>
        </Form>
      ) : null}
      <GroupMembers members={members.data ?? []} userId={userId} busy={busy} onAction={setAction} />
      {canManage ? <GroupAvatarForm conversationId={id} /> : null}

      {canManage ? (
        <Form noValidate className="space-y-3" aria-label={t('group.add')} onSubmit={() => void handleInvite()}>
          <UserPicker
            selected={invitees}
            excluded={(members.data ?? []).flatMap((member) => (member.user_id ? [member.user_id] : []))}
            onChange={(users) => {
              setInvitees(users)
              setError('')
            }}
          />
          <SubmitButton variant="outline" loading={invite.isPending} disabled={busy}>
            {t('group.add')}
          </SubmitButton>
        </Form>
      ) : null}
      {me?.role === 'CHIEF' ? (
        <FormField htmlFor="portal-groupsettingsmodal-0" label={t('group.successor')}>
          <Select
            id="portal-groupsettingsmodal-0"
            ariaLabel={t('group.successor')}
            value={successor}
            onValueChange={setSuccessor}
            options={(members.data ?? [])
              .filter((m) => m.user_id !== userId)
              .map((m) => ({ value: String(m.user_id), label: m.full_name ?? String(m.user_id) }))}
            placeholder={t('group.chooseSuccessor')}
          />
        </FormField>
      ) : null}
      {me ? (
        <Button
          variant="danger"
          disabled={busy || (me.role === 'CHIEF' && !successor && (members.data?.length ?? 0) > 1)}
          onClick={() => setAction({ kind: 'leave' })}
        >
          <LogOut size={18} />
          {t('group.leave')}
        </Button>
      ) : null}
      {action ? (
        <section role="alert" className="space-y-3 rounded-xl border border-line-subtle p-4">
          <p>{t(`group.confirm.${action.kind}`)}</p>
          <footer className="flex gap-2">
            <Button variant="outline" disabled={busy} onClick={() => setAction(null)}>
              {t('cancel')}
            </Button>
            <Button loading={perform.isPending} onClick={() => void handleConfirm()}>
              {t('confirm')}
            </Button>
          </footer>
        </section>
      ) : null}
    </PortalDialog>
  )
}
