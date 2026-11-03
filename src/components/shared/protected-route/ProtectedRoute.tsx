import { useEffect, useRef } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore, type Role } from '@/stores/authStore'
import { toast } from '@/lib/toast'
import type { ProtectedRouteProps } from './protected-route.types'

export function ProtectedRoute({ allowedRoles, children }: Readonly<ProtectedRouteProps> = {}) {
  const user = useAuthStore((state) => state.user)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const hasWarnedRef = useRef(false)

  const isRoleDenied = Boolean(
    user &&
      allowedRoles &&
      allowedRoles.length > 0 &&
      !user.roles.some((r) => allowedRoles.includes(r as Role))
  )

  useEffect(() => {
    if (isRoleDenied && !hasWarnedRef.current) {
      hasWarnedRef.current = true
      toast.error('Bạn không có quyền truy cập chức năng này.')
    }
  }, [isRoleDenied])

  if (!hasHydrated) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (isRoleDenied) {
    const isTeacher = user.roles.some((r) =>
      ['teacher', 'LECTURER', 'admin', 'ADMIN'].includes(r)
    )
    const fallbackPath = isTeacher ? '/teacher/dashboard' : '/feed'
    return <Navigate to={fallbackPath} replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export type { ProtectedRouteProps } from './protected-route.types'
