import { useState, useRef, useEffect, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Camera } from 'lucide-react'
import { Modal } from '@/components/ui/overlay'
import {
  Form,
  FormField,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/forms'
import { Button, SubmitButton } from '@/components/ui/actions'
import { Avatar } from '@/components/ui/data-display'
import { useUpdateProfileMutation } from '@/hooks/queries/useProfileQuery'
import { uploadSingleMedia } from '@/services/media-upload.service'
import { toast } from '@/lib/toast'
import { getApiError } from '@/lib/api-error'
import type { ProfileResponse } from '@/types'

interface EditProfileModalProps {
  isOpen: boolean
  profile: ProfileResponse
  onClose: () => void
}

export function EditProfileModal({ isOpen, profile, onClose }: Readonly<EditProfileModalProps>) {
  const { t } = useTranslation()
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | ''>(profile.gender ?? '')
  const [dateOfBirth, setDateOfBirth] = useState(profile.date_of_birth ?? '')
  const [timezone, setTimezone] = useState(profile.timezone ?? 'Asia/Ho_Chi_Minh')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const coverInput = useRef<HTMLInputElement>(null)
  const avatarUrl = profile.avatar_url || ''
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateMutation = useUpdateProfileMutation()
  useEffect(
    () => () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    },
    [avatarPreview]
  )

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit() {
    if (loading) return
    if (!fullName.trim()) {
      setError(t('social.profileNameRequired'))
      return
    }
    setLoading(true)
    try {
      const [avatar, cover] = await Promise.all([
        avatarFile ? uploadSingleMedia(avatarFile, 'AVATAR') : undefined,
        coverFile ? uploadSingleMedia(coverFile, 'COVER') : undefined,
      ])

      await updateMutation.mutateAsync({
        full_name: fullName.trim(),
        bio: bio.trim(),
        gender: gender || undefined,
        avatar_url: avatar?.url ?? profile.avatar_url,
        cover_url: cover?.url ?? profile.cover_url,
        date_of_birth: dateOfBirth || undefined,
        timezone,
      })
      toast.success(t('profile.updateSuccess', 'Cập nhật thông tin hồ sơ thành công!'))
      onClose()
    } catch (cause) {
      setError(getApiError(cause, t('zone2.actionError')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        if (!loading) onClose()
      }}
      title={t('profile.editTitle', 'Chỉnh sửa hồ sơ cá nhân')}
      size="lg"
    >
      <Form onSubmit={handleSubmit} noValidate onInput={() => setError('')} className="space-y-4">
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
            {/* rogym-convention-exempt: NO_RAW_FORM_ELEMENTS [Hidden native file input for avatar selection] */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              aria-label={t('profile.edit_profile')}
              disabled={loading}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 rounded-full h-11 w-11 p-0 shadow"
              aria-label={t('profile.edit_profile')}
              disabled={loading}
            >
              <Camera size={14} />
            </Button>
          </div>
        </div>

        {/* rogym-convention-exempt: NO_RAW_FORM_ELEMENTS [Native file selection for profile cover upload] */}
        <input
          ref={coverInput}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label={t('social.coverUpload')}
          onChange={(event) => {
            setCoverFile(event.target.files?.[0] ?? null)
            setError('')
          }}
          disabled={loading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => coverInput.current?.click()}
          disabled={loading}
        >
          {coverFile?.name ?? t('social.coverUpload')}
        </Button>

        <FormField label={t('profile.fullNameLabel', 'Họ và tên')} required>
          <Input
            aria-label="Họ và tên"
            value={fullName}
            disabled={loading}
            onChange={(e) => setFullName(e.target.value)}
            className="text-sm min-h-11"
          />
        </FormField>

        <FormField label={t('profile.genderLabel', 'Giới tính')}>
          <Select
            aria-label="Giới tính"
            value={gender}
            disabled={loading}
            onValueChange={(val) => setGender(val as 'MALE' | 'FEMALE')}
          >
            <SelectTrigger aria-label="Chọn giới tính" className="min-h-11">
              <SelectValue placeholder="Chọn giới tính" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">{t('profile.genderMale', 'Nam')}</SelectItem>
              <SelectItem value="FEMALE">{t('profile.genderFemale', 'Nữ')}</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label={t('profile.bioLabel', 'Tiểu sử / Giới thiệu')}>
          <Textarea
            aria-label="Tiểu sử bản thân"
            value={bio}
            disabled={loading}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={300}
            className="text-sm"
          />
        </FormField>

        <FormField label={t('social.birthDate')}>
          <Input
            type="date"
            value={dateOfBirth}
            disabled={loading}
            onChange={(event) => setDateOfBirth(event.target.value)}
          />
        </FormField>
        <FormField label={t('social.timezone')}>
          <Input
            value={timezone}
            disabled={loading}
            onChange={(event) => setTimezone(event.target.value)}
          />
        </FormField>
        {error ? (
          <p role="alert" className="text-status-danger-fg">
            {error}
          </p>
        ) : null}

        <footer className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="min-h-11"
          >
            {t('common.cancel', 'Hủy')}
          </Button>
          <SubmitButton loading={loading} variant="primary" className="min-h-11 px-6">
            {t('common.saveChanges', 'Lưu thay đổi')}
          </SubmitButton>
        </footer>
      </Form>
    </Modal>
  )
}
