import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function RootRedirect() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)

  if (!hasHydrated) {
    return null
  }

  if (!isAuthenticated || !user || !token) {
    return <Navigate to="/login" replace />
  }

  const isTeacher = user.roles.some((r) =>
    ['teacher', 'LECTURER', 'admin', 'ADMIN'].includes(r)
  )

  if (isTeacher) {
    return <Navigate to="/teacher/dashboard" replace />
  }

  return <Navigate to="/feed" replace />
}

