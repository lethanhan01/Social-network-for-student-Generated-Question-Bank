import { useTranslation } from 'react-i18next'
import { UserMinus } from 'lucide-react'
import { Button } from '@/components/ui/actions/Button'
import { Select } from '@/components/ui/forms/Select'
import { Avatar } from '@/components/ui/data-display/Avatar'
import type { ConversationMemberDto } from '@/types'
import type { GroupAction } from './group.types'

export function GroupMembers({
  members,
  userId,
  busy,
  onAction,
}: {
  members: ConversationMemberDto[]
  userId: number
  busy: boolean
  onAction: (action: GroupAction) => void
}) {
  const { t } = useTranslation('portal')
  const me = members.find((member) => member.user_id === userId)
  return (
    <section className="space-y-3 border-t border-line-subtle pt-4">
      <h3 className="font-bold">{t('group.members', { count: members.length })}</h3>
      {members.map((member) => {
        const other = !!member.user_id && member.user_id !== userId
        const canRemove =
          other &&
          member.role !== 'CHIEF' &&
          (me?.role === 'CHIEF' || (me?.role === 'VILLAGE_ELDER' && member.role === 'VILLAGER'))
        return (
          <article key={member.user_id} className="space-y-3 rounded-xl bg-surface-sunken p-3">
            <header className="flex items-center gap-3">
              <Avatar src={member.avatar_url} name={member.full_name} size="sm" />
              <section className="flex-1 min-w-0">
                <h4 className="truncate text-sm font-semibold">{member.full_name}</h4>
                <p className="text-xs text-fg-secondary">{t(`group.roles.${member.role ?? 'VILLAGER'}`)}</p>
              </section>
              {canRemove ? (
                <Button
                  variant="ghost"
                  disabled={busy}
                  className="min-h-11 min-w-11"
                  aria-label={t('group.remove')}
                  onClick={() => onAction({ kind: 'remove', userId: member.user_id ?? 0 })}
                >
                  <UserMinus size={16} />
                </Button>
              ) : null}
            </header>
            {me?.role === 'CHIEF' && other ? (
              <Select
                id={`group-role-${member.user_id}`}
                ariaLabel={t('group.roleFor', { name: member.full_name })}
                value={member.role ?? 'VILLAGER'}
                disabled={busy}
                clearable={false}
                options={(['CHIEF', 'VILLAGE_ELDER', 'VILLAGER'] as const).map((value) => ({
                  value,
                  label: t(`group.roles.${value}`),
                }))}
                onValueChange={(value) => {
                  const role = (['CHIEF', 'VILLAGE_ELDER', 'VILLAGER'] as const).find((item) => item === value)
                  if (role) onAction({ kind: 'role', userId: member.user_id ?? 0, role })
                }}
              />
            ) : null}
          </article>
        )
      })}
    </section>
  )
}
