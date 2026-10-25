import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { GraduationCap, Lock, Mail } from 'lucide-react'
import { Card } from '@/components/ui/data-display'
import { Form, FormField, Input } from '@/components/ui/forms'
import { SubmitButton } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/auth.service'
import { toast } from '@/lib/toast'
import { getApiError } from '@/lib/api-error'

export default function LoginPage() {
  const [email, setEmail] = useState('an.lt235631@sis.hust.edu.vn')
  const [password, setPassword] = useState('20235631')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const currentUser = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  // Auto-redirect if already authenticated
  if (isAuthenticated && currentUser) {
    return <Navigate to={currentUser.role === 'ADMIN' ? '/admin/users' : '/feed'} replace />
  }

  async function handleSubmit(e?: React.SubmitEvent) {
    e?.preventDefault()
    const newErrors: { email?: string; password?: string } = {}
    if (!email.trim()) newErrors.email = 'Vui lòng nhập email SIS HUST'
    if (!password) newErrors.password = 'Vui lòng nhập mật khẩu'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const res = await authService.login({ email, password })
      setAuth(
        {
          user_id: res.user_id,
          username: res.username,
          role: res.role,
          avatar_url: res.avatar_url,
          cover_url: res.cover_url,
          frame_url: res.frame_url,
          verified: res.verified,
          profile_completed: res.profile_completed,
          fullName: res.username,
          email: res.username,
        },
        res.access_token || '',
        res.refresh_token
      )
      toast.success('Đăng nhập thành công!', { description: `Chào mừng trở lại, ${res.username}` })
      if (res.role === 'ADMIN') {
        navigate('/admin/users', { replace: true })
      } else {
        navigate('/feed', { replace: true })
      }
    } catch (err: unknown) {
      const errorMsg = getApiError(err, 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.')
      setErrors({ password: errorMsg })
      toast.error('Lỗi đăng nhập', { description: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-4 sm:p-6 lg:p-8 bg-surface border-line-subtle shadow-card rounded-2xl">
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-action-accent flex items-center justify-center text-text-inverse mb-4 shadow-sm">
          <GraduationCap size={32} />
        </div>
        <Heading level={2} className="text-2xl font-extrabold tracking-tight text-text-primary">
          SQB HUST
        </Heading>
        <Text size="sm" tone="muted" className="mt-1">
          Hệ Thống Mạng Xã Hội Học Tập & Ngân Hàng Đề Thi
        </Text>
      </div>

      <Form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormField
          label="Email SIS HUST"
          error={errors.email}
          required
        >
          <Input
            id="login-email"
            aria-label="Email SIS HUST"
            type="email"
            placeholder="an.lt235631@sis.hust.edu.vn"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
            }}
            leftIcon={<Mail size={16} />}
            autoComplete="email"
          />
        </FormField>

        <FormField
          label="Mật khẩu"
          error={errors.password}
          required
        >
          <Input
            id="login-password"
            aria-label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            leftIcon={<Lock size={16} />}
            autoComplete="current-password"
          />
        </FormField>

        <SubmitButton
          loading={loading}
          variant="primary"
          className="w-full justify-center mt-2"
        >
          Đăng nhập hệ thống
        </SubmitButton>
      </Form>
    </Card>
  )
}
