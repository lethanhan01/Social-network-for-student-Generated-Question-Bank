import type { MemberRole } from '@/types/api.generated'
export type GroupAction =
  { kind: 'remove'; userId: number } | { kind: 'role'; userId: number; role: MemberRole } | { kind: 'leave' }
