import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image } from '@/components/ui/data-display/Image'
import { Button, ButtonAnchor } from '@/components/ui/actions/Button'
import { Modal } from '@/components/ui/overlay/Modal'
import type { MediaItem } from '@/types'

export function PostMediaGrid({ media }: Readonly<{ media?: MediaItem[] | null }>) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<number>()
  const items = (media ?? []).filter((item) => item.url && /^https?:\/\//i.test(item.url))
  if (items.length === 0) return null
  return (
    <>
      <section
        aria-label={t('social.images')}
        className={`grid gap-2 ${items.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
      >
        {items.map((item, index) => (
          <figure
            key={item.key ?? item.url}
            className="min-w-0 overflow-hidden rounded-xl bg-surface-hover"
          >
            {item.type === 'VIDEO' ? (
              /* rogym-convention-exempt: NO_RAW_MEDIA_ELEMENTS [Native video controls provide playback and keyboard access] */
              <video
                src={item.url}
                controls
                preload="metadata"
                className="aspect-video w-full"
                aria-label={item.name ?? t('social.attachment')}
              />
            ) : item.type === 'DOCUMENT' ? (
              <ButtonAnchor
                href={item.url!}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                className="min-h-12 w-full"
              >
                {item.name ?? t('social.attachment')}
              </ButtonAnchor>
            ) : (
              <Button
                variant="ghost"
                className="h-auto w-full p-0"
                aria-label={item.name ?? t('social.imageDetail')}
                onClick={() => setSelected(index)}
              >
                <Image
                  src={item.url}
                  alt={item.name ?? t('social.imageDetail')}
                  className="aspect-video w-full object-cover"
                />
              </Button>
            )}
          </figure>
        ))}
      </section>
      <Modal
        open={selected !== undefined}
        onClose={() => setSelected(undefined)}
        title={t('social.imageDetail')}
        size="xl"
      >
        {selected !== undefined ? (
          <section className="space-y-4">
            <Image
              src={items[selected]?.url}
              alt={items[selected]?.name ?? t('social.imageDetail')}
              className="max-h-96 w-full object-contain"
            />
            <nav
              aria-label={t('social.images')}
              className="flex items-center justify-between gap-2"
            >
              <Button
                variant="ghost"
                disabled={selected === 0}
                onClick={() => setSelected(selected - 1)}
              >
                {t('social.previous')}
              </Button>
              <output>
                {t('social.mediaCount', { current: selected + 1, total: items.length })}
              </output>
              <Button
                variant="ghost"
                disabled={selected === items.length - 1}
                onClick={() => setSelected(selected + 1)}
              >
                {t('social.next')}
              </Button>
            </nav>
          </section>
        ) : null}
      </Modal>
    </>
  )
}
