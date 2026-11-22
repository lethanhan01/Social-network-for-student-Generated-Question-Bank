import type { AuthUser } from '@/stores/authStore'
import type { CourseClassResponse } from '@/types'

/** Tách và khử trùng lặp danh sách MSSV từ chuỗi nhiều dòng / dấu phẩy / khoảng trắng. */
export function parseStudentCodes(raw: string): string[] {
  const seen = new Set<string>()
  const codes: string[] = []
  for (const part of raw.split(/[\s,;]+/)) {
    const trimmed = part.trim()
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed)
      codes.push(trimmed)
    }
  }
  return codes
}

/** Chỉ giảng viên phụ trách lớp (hoặc Admin) được xem/ghi danh SV — tránh gọi API 403. */
export function canManageCourseClass(cls: CourseClassResponse, user?: AuthUser | null): boolean {
  if (!user) return false
  const isAdmin =
    user.role?.toUpperCase() === 'ADMIN' ||
    user.roles.some((role) => role.toUpperCase() === 'ADMIN')
  if (isAdmin) return true
  return cls.lecturer_id != null && user.user_id != null && cls.lecturer_id === user.user_id
}
