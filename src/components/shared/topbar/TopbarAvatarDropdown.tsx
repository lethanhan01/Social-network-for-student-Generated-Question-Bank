import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, LayoutDashboard, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { Avatar } from '@/components/ui/data-display'
import { ThemeSegmentedControl } from '@/components/ui/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/overlay'
import { authService } from '@/services/auth.service'
import { toast } from '@/lib/toast'
import { cn } from '@/utils/cn'

export function TopbarAvatarDropdown() {
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { t: tCommon } = useTranslation('common')

  const initials = user?.fullName
    ? user.fullName.trim().charAt(0).toUpperCase()
    : 'U'

  function goProfile() {
    setOpen(false)
    navigate('/profile')
  }

  function goDashboard() {
    setOpen(false)
    const isTeacher = user?.roles?.some((r) => ['teacher', 'LECTURER', 'admin', 'ADMIN'].includes(r))
    navigate(isTeacher ? '/teacher/dashboard' : '/student/dashboard')
  }

  function goSettings() {
    setOpen(false)
    navigate('/settings')
  }

  async function handleLogout() {
    setOpen(false)
    try {
      await authService.logout()
    } catch {
      // Ignore network errors during logout
    } finally {
      clearAuth()
      toast.success('Đã đăng xuất thành công')
      navigate('/login', { replace: true })
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS, SEMANTIC_CLICK [Radix DropdownMenuTrigger asChild interactive avatar button] */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-transparent transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus cursor-pointer"
          aria-label={tCommon('user.menu', 'Menu người dùng')}
        >
          <Avatar
            src={user?.avatarUrl ?? undefined}
            name={user?.fullName ?? 'User'}
            fallback={initials}
            size="sm"
            tone="accent"
            className={cn(open && 'ring-2 ring-line-focus')}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 p-1 bg-surface-elevated border border-line-subtle shadow-card rounded-xl text-fg-primary z-50"
      >
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [User info summary header in dropdown] */}
        <div className="px-3 py-2 border-b border-line-subtle">
          <p className="text-sm font-semibold truncate text-fg-primary">
            {user?.fullName || 'Sinh viên HUST'}
          </p>
          <p className="text-xs text-fg-muted truncate">
            {user?.email || 'student@sis.hust.edu.vn'}
          </p>
        </div>

        <DropdownMenuItem
          onClick={goProfile}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-card-hover cursor-pointer"
        >
          <User size={16} />
          <span>{tCommon('user.profile', 'Hồ sơ cá nhân')}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={goDashboard}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-card-hover cursor-pointer"
        >
          <LayoutDashboard size={16} />
          <span>{tCommon('nav.dashboard', 'Tổng quan học tập')}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={goSettings}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-card-hover cursor-pointer"
        >
          <Settings size={16} />
          <span>{tCommon('nav.settings', 'Cài đặt hệ thống')}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 border-t border-line-subtle" />

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Theme switcher row in dropdown] */}
        <div className="px-3 py-1.5">
          <p className="text-xs text-fg-muted mb-1.5 font-medium">Giao diện</p>
          <ThemeSegmentedControl size="sm" />
        </div>

        <DropdownMenuSeparator className="my-1 border-t border-line-subtle" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-status-danger-fg hover:bg-status-danger-bg cursor-pointer"
        >
          <LogOut size={16} />
          <span>{tCommon('user.logout', 'Đăng xuất')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
