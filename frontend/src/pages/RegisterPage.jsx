import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, error, clearError, isAuthenticated } = useAuthStore()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })
  const [localError, setLocalError] = useState(null)

  useEffect(() => {
    clearError()
  }, [clearError])

  useEffect(() => {
    if (isAuthenticated()) navigate('/tai-khoan', { replace: true })
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)

    if (form.password.length < 6) {
      setLocalError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setLocalError('Mật khẩu xác nhận không khớp.')
      return
    }

    try {
      await register({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone || null,
      })
      navigate('/tai-khoan', { replace: true })
    } catch {
      // error already in store
    }
  }

  const displayError = localError || error

  return (
    <div className="bg-ivory-50 min-h-[calc(100vh-200px)] py-20 md:py-28">
      <div className="container-narrow">
        <div className="max-w-md mx-auto">
          <p className="eyebrow text-center mb-4">— Trở thành thành viên</p>
          <h1 className="font-display text-4xl md:text-5xl text-ink-900 text-center mb-3">
            Đăng ký
          </h1>
          <p className="text-center text-ink-600 font-light mb-12">
            Tạo tài khoản để theo dõi đơn hàng và nhận ưu đãi riêng.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label
                htmlFor="fullName"
                className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2"
              >
                Họ và tên
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={form.fullName}
                onChange={handleChange}
                className="input-editorial"
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="input-editorial"
                placeholder="email@florist.vn"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2"
              >
                Số điện thoại (tùy chọn)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="input-editorial"
                placeholder="0987 654 321"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                className="input-editorial"
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2"
              >
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="input-editorial"
                placeholder="Nhập lại mật khẩu"
              />
            </div>

            {displayError && (
              <p className="text-sm text-red-700 font-light">{displayError}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-luxury w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-600 mt-10 font-light">
            Đã có tài khoản?{' '}
            <Link
              to="/dang-nhap"
              className="text-ink-900 underline underline-offset-4 hover:text-champagne-600 transition-colors"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
