import { useState, useMemo, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, User, Check } from 'lucide-react'
import { Modal } from '@/components/ui/overlay/Modal'
import { Button } from '@/components/ui/actions/Button'
import { SearchInput } from '@/components/ui/forms/SearchInput'
import { Input } from '@/components/ui/forms/Input'
import { Form } from '@/components/ui/forms/Form'
import { FormField } from '@/components/ui/forms/FormField'
import { Avatar } from '@/components/ui/data-display/Avatar'
import { SegmentedControl } from '@/components/ui/navigation/SegmentedControl'
import { useFriendsQuery } from '@/hooks/queries/useRelationshipsQuery'
import {
  useCreateDirectConversationMutation,
  useCreateGroupConversationMutation,
} from '@/hooks/queries/useChatQuery'
import { toast } from '@/lib/toast'
import { getApiError } from '@/lib/api-error'
import { cn } from '@/utils/cn'

interface NewChatModalProps {
  open: boolean
  onClose: () => void
  onCreated: (conversationId: number) => void
}

export function NewChatModal({ open, onClose, onCreated }: Readonly<NewChatModalProps>) {
  const { t } = useTranslation('chat')
  const [mode, setMode] = useState<'DIRECT' | 'GROUP'>('DIRECT')
  const [searchQuery, setSearchQuery] = useState('')
  const [groupName, setGroupName] = useState('')
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([])

  const friendsQuery = useFriendsQuery()
  const createDirectMutation = useCreateDirectConversationMutation()
  const createGroupMutation = useCreateGroupConversationMutation()

  const friends = useMemo(() => friendsQuery.data?.items ?? [], [friendsQuery.data?.items])

  const filteredFriends = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return friends
    return friends.filter((f) => (f.full_name || '').toLowerCase().includes(q))
  }, [friends, searchQuery])

  function toggleFriend(id: number) {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  async function handleDirectChat(friendId: number) {
    try {
      const res = await createDirectMutation.mutateAsync({ target_user_id: friendId })
      if (res.conversation_id) {
        onCreated(res.conversation_id)
        onClose()
      }
    } catch (err) {
      toast.error(getApiError(err))
    }
  }

  async function handleCreateGroup(e: FormEvent) {
    e.preventDefault()
    if (!groupName.trim()) {
      toast.error(t('groupNamePlaceholder', 'Vui lòng nhập tên nhóm'))
      return
    }
    if (selectedFriendIds.length < 2) {
      toast.error('Nhóm cần tối thiểu 2 thành viên khác bạn')
      return
    }

    try {
      const res = await createGroupMutation.mutateAsync({
        name: groupName.trim(),
        member_ids: selectedFriendIds,
      })
      if (res.conversation_id) {
        toast.success(t('createGroupSuccess', 'Tạo nhóm thành công'))
        onCreated(res.conversation_id)
        onClose()
      }
    } catch (err) {
      toast.error(getApiError(err))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('newMessage', 'Tạo đoạn chat mới')}
      size="md"
    >
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [New chat modal container] */}
      <div className="space-y-4">
        <SegmentedControl
          value={mode}
          onValueChange={(val) => setMode(val as 'DIRECT' | 'GROUP')}
          options={[
            { value: 'DIRECT', label: t('newDirect', 'Nhắn tin trực tiếp'), icon: <User size={16} /> },
            { value: 'GROUP', label: t('newGroup', 'Tạo nhóm chat'), icon: <Users size={16} /> },
          ]}
        />

        {mode === 'GROUP' ? (
          <Form onSubmit={handleCreateGroup} noValidate>
            <FormField label={t('groupName', 'Tên nhóm')}>
              <Input
                id="group-name-input"
                aria-label={t('groupName', 'Tên nhóm')}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder={t('groupNamePlaceholder', 'Nhập tên nhóm trò chuyện...')}
                className="mb-3"
              />
            </FormField>
          </Form>
        ) : null}

        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('searchFriends', 'Tìm kiếm bạn bè theo tên...')}
          aria-label={t('searchFriends', 'Tìm kiếm bạn bè')}
        />

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Friends scrollable list container] */}
        <div className="max-h-64 overflow-y-auto divide-y divide-line-subtle/40 rounded-xl border border-line-subtle">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => {
              const friendId = friend.user_id ?? 0
              const isSelected = selectedFriendIds.includes(friendId)
              const name = friend.full_name || 'Bạn học SQB'
              const initials = name.trim().charAt(0).toUpperCase()

              return (
                <Button
                  key={friendId}
                  variant="ghost"
                  onClick={() =>
                    mode === 'DIRECT' ? handleDirectChat(friendId) : toggleFriend(friendId)
                  }
                  className="w-full flex items-center justify-between p-3 rounded-none hover:bg-surface-card-hover min-h-12 h-auto text-left"
                >
                  {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Friend row avatar and info] */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={friend.avatar_url ?? undefined}
                      name={name}
                      fallback={initials}
                      size="sm"
                      tone="accent"
                    />
                    {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Friend name text stack] */}
                    <div className="truncate">
                      <p className="text-sm font-semibold text-fg-primary truncate">{name}</p>
                      <p className="text-xs text-fg-muted truncate">
                        {friend.mutual_friends_count
                          ? `${friend.mutual_friends_count} bạn chung`
                          : 'Bạn bè HUST'}
                      </p>
                    </div>
                  </div>

                  {mode === 'GROUP' ? (
                    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Checkbox state indicator] */
                    <div
                      className={cn(
                        'w-5 h-5 rounded-md border flex items-center justify-center shrink-0',
                        isSelected
                          ? 'bg-action-accent border-action-accent text-fg-on-solid'
                          : 'border-line-strong bg-surface-card'
                      )}
                    >
                      {isSelected ? <Check size={14} /> : null}
                    </div>
                  ) : null}
                </Button>
              )
            })
          ) : (
            <p className="p-4 text-center text-sm text-fg-muted">
              {t('noFriendsFound', 'Không tìm thấy bạn bè nào')}
            </p>
          )}
        </div>

        {mode === 'GROUP' ? (
          <Button
            variant="primary"
            onClick={handleCreateGroup}
            disabled={createGroupMutation.isPending || selectedFriendIds.length < 2 || !groupName.trim()}
            className="w-full min-h-11"
          >
            {createGroupMutation.isPending
              ? t('creating', 'Đang tạo nhóm...')
              : `${t('createGroup', 'Tạo nhóm')} (${selectedFriendIds.length})`}
          </Button>
        ) : null}
      </div>
    </Modal>
  )
}
