import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/actions/Button'
import { toast } from '@/lib/toast'

export function PostAttachments({
  files,
  disabled,
  onChange,
}: Readonly<{ files: File[]; disabled: boolean; onChange: (files: File[]) => void }>) {
  const { t } = useTranslation()
  const input = useRef<HTMLInputElement>(null)
  return (
    <section className="space-y-3">
      {/* rogym-convention-exempt: NO_RAW_FORM_ELEMENTS [Native file picker required for post media uploads] */}
      <input
        ref={input}
        type="file"
        multiple
        className="hidden"
        accept="image/*,video/*,application/pdf"
        disabled={disabled}
        aria-label={t('feed.createPost.addMedia')}
        onChange={(event) => {
          const next = [...files, ...Array.from(event.target.files ?? [])]
          if (next.length > 10 || next.some((file) => !file.size || file.size > 15 * 1024 * 1024))
            toast.error(t('social.fileError'))
          else onChange(next)
          event.target.value = ''
        }}
      />
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => input.current?.click()}
        leftIcon={<ImagePlus size={18} />}
      >
        {t('feed.createPost.addMedia')}
      </Button>
      {files.map((file, index) => (
        <p
          key={`${file.name}-${file.lastModified}-${index}`}
          className="flex items-center justify-between gap-2 rounded-xl bg-surface-hover px-3 text-sm"
        >
          <strong className="truncate font-normal">{file.name}</strong>
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            aria-label={t('social.removeFile', { name: file.name })}
            onClick={() => onChange(files.filter((_, fileIndex) => fileIndex !== index))}
          >
            <X size={18} />
          </Button>
        </p>
      ))}
    </section>
  )
}
