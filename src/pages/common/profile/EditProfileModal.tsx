import { useState, useRef, useEffect, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Camera } from 'lucide-react'
import { Modal } from '@/components/ui/overlay'
import {
  Form, FormField, Input, Textarea, Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/forms'
import { Button, SubmitButton } from '@/components/ui/actions'
import { Avatar, Card, Image } from '@/components/ui/data-display'
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

async function uploadProfileMedia(avatarFile: File | null, coverFile: File | null) {
  const [avatar, cover] = await Promise.all([
    avatarFile ? uploadSingleMedia(avatarFile, 'AVATAR') : undefined,
    coverFile ? uploadSingleMedia(coverFile, 'COVER') : undefined,
  ])
  return { avatarUrl: avatar?.url, coverUrl: cover?.url }
}

export function EditProfileModal({ isOpen, profile, onClose }: Readonly<EditProfileModalProps>) {
  const { t } = useTranslation()
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | ''>(profile.gender ?? '')
  const [dateOfBirth, setDateOfBirth] = useState(profile.date_of_birth ?? '')
  const [timezone, setTimezone] = useState(profile.timezone ?? 'Asia/Ho_Chi_Minh')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const coverInput = useRef<HTMLInputElement>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarSrc = avatarPreview || profile.avatar_url || undefined
  const coverSrc = coverPreview || profile.cover_url || ''
  const updateMutation = useUpdateProfileMutation()

  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    if (coverPreview) URL.revokeObjectURL(coverPreview)
  }, [avatarPreview, coverPreview])

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function handleCoverChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setCoverFile(file)
    setCoverPreview(file ? URL.createObjectURL(file) : null)
    setError('')
  }

  async function handleSubmit() {
    if (loading) return
    if (!fullName.trim()) {
      setError(t('social.profileNameRequired'))
      return
    }
    setLoading(true)
    try {
      const { avatarUrl, coverUrl } = await uploadProfileMedia(avatarFile, coverFile)
      await updateMutation.mutateAsync({
        full_name: fullName.trim(),
        bio: bio.trim(),
        gender: gender || undefined,
        avatar_url: avatarUrl ?? profile.avatar_url,
        cover_url: coverUrl ?? profile.cover_url,
        date_of_birth: dateOfBirth || undefined,
        timezone,
      })
      toast.success(t('profile.updateSuccess'))
      onClose()
    } catch (cause) {
      setError(getApiError(cause, t('zone2.actionError')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={isOpen} onClose={() => { if (!loading) onClose() }} title={t('profile.editTitle')} size="lg">
      <Form onSubmit={handleSubmit} noValidate onInput={() => setError('')} className="space-y-4">
        <Card as="section" padding="none" className="social-card overflow-hidden">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Cover banner preview container with action overlay] */}
          <div className="relative h-28 sm:h-36 bg-gradient-to-r from-action-accent/30 via-action-accent/10 to-surface-elevated">
            {coverSrc ? (
              <Image src={coverSrc} alt={t('social.coverUpload')} className="h-full w-full object-cover" />
            ) : null}
            {/* rogym-convention-exempt: NO_RAW_FORM_ELEMENTS [Native file selection for profile cover upload] */}
            <input ref={coverInput} type="file" accept="image/*" className="hidden" aria-label={t('social.coverUpload')} onChange={handleCoverChange} disabled={loading} />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => coverInput.current?.click()}
              disabled={loading}
              leftIcon={<Camera size={14} />}
              className="absolute bottom-2 right-2 min-h-11 rounded-xl border border-line-subtle bg-surface-card px-3 shadow-sm"
            >
              {t('social.coverUpload')}
            </Button>
          </div>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Avatar overlap container with relative positioning for camera trigger] */}
          <div className="relative -mt-12 mb-3 ml-4 inline-flex">
            <Avatar
              src={avatarSrc}
              name={fullName}
              fallback={fullName.charAt(0).toUpperCase()}
              size="hero"
              tone="accent"
              className="ring-4 ring-surface-card bg-surface-card"
            />
            {/* rogym-convention-exempt: NO_RAW_FORM_ELEMENTS [Hidden native file input for avatar selection] */}
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" aria-label={t('profile.edit_profile')} disabled={loading} />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 h-11 w-11 rounded-full border border-line-subtle bg-surface-card p-0 shadow-sm"
              aria-label={t('profile.edit_profile')}
              disabled={loading}
            >
              <Camera size={16} />
            </Button>
          </div>
        </Card>

        <FormField label={t('profile.fullNameLabel')} required>
          <Input
            aria-label={t('profile.fullNameLabel')}
            value={fullName}
            disabled={loading}
            onChange={(e) => setFullName(e.target.value)}
            className="text-sm min-h-11"
          />
        </FormField>

        <FormField label={t('profile.genderLabel')}>
          <Select
            aria-label={t('profile.genderLabel')}
            value={gender}
            disabled={loading}
            onValueChange={(val) => setGender(val as 'MALE' | 'FEMALE')}
          >
            <SelectTrigger aria-label={t('profile.genderLabel')} className="min-h-11">
              <SelectValue placeholder={t('profile.genderLabel')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">{t('profile.genderMale')}</SelectItem>
              <SelectItem value="FEMALE">{t('profile.genderFemale')}</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label={t('profile.bioLabel')}>
          <Textarea
            aria-label={t('profile.bioLabel')}
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
            aria-label={t('social.birthDate')}
            type="date"
            value={dateOfBirth}
            disabled={loading}
            onChange={(event) => setDateOfBirth(event.target.value)}
            className="text-sm min-h-11"
          />
        </FormField>
        <FormField label={t('social.timezone')}>
          <Input
            aria-label={t('social.timezone')}
            value={timezone}
            disabled={loading}
            onChange={(event) => setTimezone(event.target.value)}
            className="text-sm min-h-11"
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
            {t('common.cancel')}
          </Button>
          <SubmitButton loading={loading} variant="primary" className="min-h-11 px-6">
            {t('common.saveChanges')}
          </SubmitButton>
        </footer>
      </Form>
    </Modal>
  )
}
