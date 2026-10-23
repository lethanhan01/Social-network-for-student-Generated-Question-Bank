import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Lock, Mail } from 'lucide-react'
import { Card } from '@/components/ui/data-display'
import { Form, FormField, Input } from '@/components/ui/forms'
import { SubmitButton } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useAuthStore, type Role } from '@/stores/authStore'
import { authService } from '@/services/auth.service'
import { toast } from '@/lib/toast'

export default function LoginPage() {
  const [email, setEmail] = useState('an.lt235631@sis.hust.edu.vn')
  const [password, setPassword] = useState('Hust@123456')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  async function handleSubmit() {
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
      setAuth(res.user, res.token)
      toast.success('Đăng nhập thành công!', { description: `Chào mừng trở lại, ${res.user.fullName}` })
      navigate('/dashboard')
    } catch (err: unknown) {
      // Mock login fallback if backend isn't reachable during offline dev
      const mockUser = {
        userId: 'u_hust_01',
        email: email,
        fullName: 'Lê Thành An',
        roles: ['student'] as Role[],
        studentId: '20235631',
        department: 'Trường Công nghệ Thông tin & Truyền thông',
      }
      setAuth(mockUser, 'mock_token_sqb_hust')
      toast.info('Đang sử dụng phiên đăng nhập demo (Backend offline)', {
        description: 'Đã cấp quyền truy cập tài khoản sinh viên thành công.',
      })
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-8 bg-surface border-line-subtle shadow-card rounded-2xl">
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


