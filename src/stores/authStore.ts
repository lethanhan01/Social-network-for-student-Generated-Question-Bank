import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'STUDENT' | 'LECTURER' | 'ADMIN' | 'student' | 'teacher' | 'admin' | 'user'

export interface AuthUser {
  user_id?: number
  userId?: string
  username?: string
  email?: string
  fullName?: string
  role?: 'STUDENT' | 'LECTURER' | 'ADMIN'
  roles: Role[]
  avatar_url?: string | null
  avatarUrl?: string | null
  cover_url?: string | null
  frame_url?: string | null
  verified?: boolean
  profile_completed?: boolean
  studentId?: string | null
  department?: string | null
  memberId?: string | null
}

export type LogoutListener = () => void
const logoutListeners = new Set<LogoutListener>()

export function onLogout(listener: LogoutListener): () => void {
  logoutListeners.add(listener)
  return () => {
    logoutListeners.delete(listener)
  }
}

export function notifyLogout(): void {
  logoutListeners.forEach((listener) => {
    try {
      listener()
    } catch (err) {
      console.error('[onLogout listener error]:', err)
    }
  })
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  hasHydrated: boolean

  setAuth: (user: Omit<AuthUser, 'roles'> & { roles?: Role[] }, token: string, refreshToken?: string | null) => void
  setToken: (token: string) => void
  setUser: (user: AuthUser) => void
  clearAuth: () => void
  setHasHydrated: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,

      setAuth: (user, token, refreshToken = null) => {
        const computedRoles: Role[] = user.roles && user.roles.length > 0
          ? user.roles
          : (user.role ? [user.role, user.role.toLowerCase() as Role] : ['student'])

        return set({
          user: {
            ...user,
            roles: computedRoles,
            avatarUrl: user.avatarUrl ?? user.avatar_url ?? null,
          },
          token,
          refreshToken,
          isAuthenticated: true,
        })
      },

      setToken: (token) => set({ token }),

      setUser: (user) => set({ user }),

      clearAuth: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        })
        notifyLogout()
      },

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'sqb-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
