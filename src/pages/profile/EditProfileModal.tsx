import { useState, useRef, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Camera } from 'lucide-react'
import { Modal } from '@/components/ui/overlay'
import {
  Form,
  FormField,
  Input,
  Textarea,
} from '@/components/ui/forms'
import { Button, SubmitButton } from '@/components/ui/actions'
import { Avatar } from '@/components/ui/data-display'
import { Icon } from '@/components/ui/typography'
import { useUpdateProfileMutation } from '@/hooks/queries/useProfileQuery'
import { uploadSingleMedia } from '@/services/media-upload.service'
import { toast } from '@/lib/toast'
import type { ProfileResponse } from '@/types'

interface EditProfileModalProps {
  isOpen: boolean
  profile: ProfileResponse
  onClose: () => void
}

export function EditProfileModal({
  isOpen,
  profile,
  onClose,
}: Readonly<EditProfileModalProps>) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const updateMutation = useUpdateProfileMutation()

  const [fullName, setFullName] = useState(profile.full_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const avatarUrl = profile.avatar_url || ''
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(e?: React.SubmitEvent) {
    e?.preventDefault()
    setLoading(true)
    try {
      let finalAvatarUrl = avatarUrl
      if (avatarFile) {
        const uploaded = await uploadSingleMedia(avatarFile, 'AVATAR')
        if (uploaded.url) {
          finalAvatarUrl = uploaded.url
        }
      }

      await updateMutation.mutateAsync({
        full_name: fullName.trim(),
        bio: bio.trim() || undefined,
        avatar_url: finalAvatarUrl || undefined,
      })
      toast.success(t('profile.updateSuccess', 'Cập nhật thông tin hồ sơ thành công!'))
      onClose()
    } catch {
      toast.error(t('profile.updateError', 'Không thể cập nhật hồ sơ. Vui lòng thử lại.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose} title={t('profile.editTitle', 'Chỉnh sửa hồ sơ cá nhân')} size="lg">
      <Form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Avatar change section */}
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Avatar upload centered layout] */}
        <div className="flex flex-col items-center justify-center gap-2 py-2">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Avatar wrapper relative container] */}
          <div className="relative group">
            <Avatar
              src={avatarPreview || avatarUrl || undefined}
              name={fullName}
              fallback={fullName.charAt(0).toUpperCase()}
              size="lg"
              tone="accent"
            />
            {/* rogym-convention-exempt: NO_RAW_FORM_ELEMENTS, FORMS_LABEL_ASSOC [Hidden native file input for avatar selection] */}
            <input
              id="edit-profile-avatar-input"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              aria-label={t('profile.avatarUploadLabel', 'Tải lên ảnh đại diện mới')}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 min-h-8 min-w-8 shadow"
              aria-label={t('profile.changeAvatarLabel', 'Đổi ảnh đại diện')}
            >
              <Icon icon={Camera} size="xs" />
            </Button>
          </div>
        </div>

        <FormField label={t('profile.fullNameLabel', 'Họ và tên')} required>
          <Input
            id="profile-fullName"
            aria-label={t('profile.fullNameLabel', 'Họ và tên')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="text-sm min-h-11"
            placeholder={t('profile.fullNamePlaceholder', 'Nguyễn Văn A')}
            required
          />
        </FormField>

        <FormField label={t('profile.bioLabel', 'Tiểu sử / Giới thiệu')}>
          <Textarea
            id="profile-bio"
            aria-label={t('profile.bioLabel', 'Tiểu sử / Giới thiệu bản thân')}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={t('profile.bioPlaceholder', 'Chia sẻ đôi nét về bạn...')}
            rows={3}
            maxLength={300}
            className="text-sm"
          />
        </FormField>

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Modal action buttons container] */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-line-subtle">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading || updateMutation.isPending} className="min-h-11">
            {t('common.cancel', 'Hủy')}
          </Button>
          <SubmitButton loading={loading || updateMutation.isPending} variant="primary" className="min-h-11 px-6">
            {t('common.saveChanges', 'Lưu thay đổi')}
          </SubmitButton>
        </div>
      </Form>
    </Modal>
  )
}
