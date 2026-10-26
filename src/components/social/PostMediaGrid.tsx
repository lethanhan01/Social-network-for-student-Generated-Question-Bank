import { useState } from 'react'
import { Image } from '@/components/ui/data-display'
import { Modal } from '@/components/ui/overlay'
import type { MediaItem } from '@/types'

interface PostMediaGridProps {
  media?: MediaItem[]
}

export function PostMediaGrid({ media }: Readonly<PostMediaGridProps>) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!media || media.length === 0) return null

  return (
    <>
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Media grid wrapper] */}
      <div
        className={`grid gap-2 rounded-xl overflow-hidden my-2.5 ${
          media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
        }`}
      >
        {media.slice(0, 4).map((item, idx) => {
          const isVideo = item.type === 'VIDEO' || item.url?.endsWith('.mp4')
          const itemKey = item.key ?? item.url ?? `item-${idx}`
          return (
            /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Media preview card container] */
            <div
              key={itemKey}
              className="relative aspect-video bg-surface-elevated rounded-lg overflow-hidden border border-line-subtle"
            >
              {isVideo ? (
                <video
                  src={item.url}
                  controls
                  className="w-full h-full object-cover"
                  aria-label={item.name || 'Video bài viết'}
                />
              ) : (
                /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Image clickable wrapper] */
                <div
                  className="w-full h-full cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedImage(item.url || null)}
                >
                  <Image
                    src={item.url}
                    alt={item.name || `Hình ảnh bài viết ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Modal
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        title="Chi tiết hình ảnh"
        size="xl"
      >
        {selectedImage ? (
          <Image
            src={selectedImage}
            alt="Ảnh phóng to"
            className="max-w-full max-h-[75vh] rounded-xl object-contain mx-auto"
          />
        ) : null}
      </Modal>
    </>
  )
}
