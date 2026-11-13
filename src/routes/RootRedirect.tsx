import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function RootRedirect() {
  const { isAuthenticated, user, token, hasHydrated } = useAuthStore()

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

