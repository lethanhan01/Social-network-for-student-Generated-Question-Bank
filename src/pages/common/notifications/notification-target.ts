import type { NotificationTargetDto } from '@/types'
export function notificationPath(target?: NotificationTargetDto): string | null {
  const id = target?.target_id
  if (!id || !Number.isSafeInteger(id) || id <= 0) return null
  switch (target?.type) {
    case 'POST':
      return `/posts/${id}`
    case 'USER':
      return `/profile/${id}`
    case 'CONVERSATION':
      return `/messages?conversation=${id}`
    case 'BADGE':
      return '/profile'
    default:
      return null
  }
}
