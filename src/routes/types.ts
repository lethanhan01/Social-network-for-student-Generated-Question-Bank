export type UserRole = 'STUDENT' | 'LECTURER' | 'ADMIN' | 'student' | 'teacher' | 'admin' | 'user'

export interface RouteMeta {
  title?: string
  requiresAuth?: boolean
  allowedRoles?: UserRole[]
}

