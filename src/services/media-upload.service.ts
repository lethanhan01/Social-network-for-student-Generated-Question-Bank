import axios from 'axios'
import { utilityService } from './utility.service'
import type { MediaItem, PresignFileItem } from '@/types'

export type UploadPurpose =
  | 'AVATAR'
  | 'COVER'
  | 'QUESTION'
  | 'POST'
  | 'COMMENT'
  | 'CHAT'
  | 'DOCUMENT'

function detectMediaType(file: File): 'IMAGE' | 'VIDEO' | 'DOCUMENT' {
  if (file.type.startsWith('image/')) return 'IMAGE'
  if (file.type.startsWith('video/')) return 'VIDEO'
  return 'DOCUMENT'
}

/**
 * Upload single media item compliant with UC32 (Cloudflare R2 Media).
 * 1. Tries presigned URL workflow: POST /medias/presign -> PUT binary -> POST /medias/verify
 * 2. If presign workflow fails (e.g. backend CORS or missing R2 config), fallbacks to direct POST /medias/upload
 */
export async function uploadSingleMedia(
  file: File,
  purpose: UploadPurpose = 'POST'
): Promise<MediaItem> {
  const mediaType = detectMediaType(file)

  try {
    const presignReqItem: PresignFileItem = {
      file_name: file.name,
      file_size: file.size,
      content_type: file.type || 'application/octet-stream',
      purpose,
    }

    const presignRes = await utilityService.getPresignedUrls({
      files: [presignReqItem],
    })

    const targetUrlItem = presignRes?.presigned_urls?.[0]
    if (targetUrlItem?.upload_url && targetUrlItem.public_url) {
      // Direct binary PUT to Cloudflare R2 presigned URL (bypassing authorization header)
      await axios.put(targetUrlItem.upload_url, file, {
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        withCredentials: false,
      })

      // Verify step required by UC32
      const verifyRes = await utilityService.verifyMedias({
        urls: [targetUrlItem.public_url],
      })

      const isMissing = verifyRes?.missing_urls?.includes(targetUrlItem.public_url)
      if (isMissing) {
        throw new Error('VERIFY_FAILED: File uploaded but failed verification on server')
      }

      return {
        url: targetUrlItem.public_url,
        key: targetUrlItem.object_key,
        name: file.name,
        size: file.size,
        type: mediaType,
      }
    }
  } catch (err: unknown) {
    // If presign flow failed with network / CORS / 404, fallback to direct multipart upload
    const directRes = await utilityService.uploadDirectMedia(file, purpose)
    return {
      url: directRes.url,
      key: directRes.object_key,
      name: file.name,
      size: directRes.file_size ?? file.size,
      type: directRes.media_type ?? mediaType,
      width: directRes.width,
      height: directRes.height,
    }
  }

  // Fallback direct upload if presign returned empty urls
  const directRes = await utilityService.uploadDirectMedia(file, purpose)
  return {
    url: directRes.url,
    key: directRes.object_key,
    name: file.name,
    size: directRes.file_size ?? file.size,
    type: directRes.media_type ?? mediaType,
    width: directRes.width,
    height: directRes.height,
  }
}

export async function uploadMultipleMedia(
  files: File[],
  purpose: UploadPurpose = 'POST'
): Promise<MediaItem[]> {
  return Promise.all(files.map((f) => uploadSingleMedia(f, purpose)))
}
