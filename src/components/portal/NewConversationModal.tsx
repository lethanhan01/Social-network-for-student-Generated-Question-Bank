import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, FormField, Input, Select } from '@/components/ui/forms'
import { SubmitButton } from '@/components/ui/actions/SubmitButton'
import { PortalDialog } from './PortalDialog'
import { UserPicker, type PickedUser } from './UserPicker'
import { useCreateDirectConversationMutation, useCreateGroupConversationMutation } from '@/hooks/queries/useChatQuery'
import { getApiError } from '@/lib/api-error'
import { groupNameSchema } from './portal.schemas'

export function NewConversationModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: number) => void }) {
  const { t } = useTranslation('portal')
  const [type, setType] = useState('DIRECT')
  const [users, setUsers] = useState<PickedUser[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const direct = useCreateDirectConversationMutation()
  const group = useCreateGroupConversationMutation()
  const busy = direct.isPending || group.isPending
  async function handleSubmit() {
    if (type === 'DIRECT' ? users.length !== 1 : users.length < 2 || !groupNameSchema.safeParse(name).success) {
      setError(t('messages.createInvalid'))
      return
    }
    try {
      const result =
        type === 'DIRECT'
          ? await direct.mutateAsync({ target_user_id: users[0].id })
          : await group.mutateAsync({ name: name.trim(), member_ids: users.map((user) => user.id) })
      if (!result.conversation_id) {
        setError(t('error'))
        return
      }
      onCreated(result.conversation_id)
    } catch (cause) {
      setError(getApiError(cause, t('error')))
    }
  }
  return (
    <PortalDialog
      title={t('messages.new')}
      description={t('messages.newDescription')}
      onClose={() => {
        if (!busy) onClose()
      }}
    >
      <Form noValidate className="space-y-4" aria-label={t('messages.new')} onSubmit={() => void handleSubmit()}>
        <FormField htmlFor="portal-newconversationmodal-0" label={t('messages.type')}>
          <Select
            id="portal-newconversationmodal-0"
            ariaLabel={t('messages.type')}
            value={type}
            clearable={false}
            onValueChange={(value) => {
              setType(value)
              setUsers([])
              setError('')
            }}
            options={(['DIRECT', 'GROUP'] as const).map((value) => ({ value, label: t(`messages.types.${value}`) }))}
          />
        </FormField>
        {type === 'GROUP' ? (
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
        ) : null}
        <UserPicker
          selected={users}
          multiple={type === 'GROUP'}
          onChange={(value) => {
            setUsers(value)
            setError('')
          }}
        />
        {error ? (
          <p role="alert" className="text-sm text-status-danger-fg">
            {error}
          </p>
        ) : null}
        <SubmitButton loading={busy}>{t('messages.create')}</SubmitButton>
      </Form>
    </PortalDialog>
  )
}
