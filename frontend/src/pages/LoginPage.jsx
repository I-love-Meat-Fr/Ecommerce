import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const from = location.state?.from?.pathname || '/tai-khoan'

  useEffect(() => {
    clearError()
  }, [clearError])

  useEffect(() => {
    if (isAuthenticated()) navigate(from, { replace: true })
  }, [isAuthenticated, navigate, from])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch {
      // error already in store
    }
  }

  return (
    <div className="bg-ivory-50 min-h-[calc(100vh-200px)] py-20 md:py-28">
      <div className="container-narrow">
        <div className="max-w-md mx-auto">
          <p className="eyebrow text-center mb-4">— Florist Members</p>
          <h1 className="font-display text-4xl md:text-5xl text-ink-900 text-center mb-3">
            Đăng nhập
          </h1>
          <p className="text-center text-ink-600 font-light mb-12">
            Chào mừng bạn quay lại. Đăng nhập để tiếp tục.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-editorial"
                placeholder="email@florist.vn"
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
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-editorial"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-700 font-light">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-luxury w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-600 mt-10 font-light">
            Chưa có tài khoản?{' '}
            <Link
              to="/dang-ky"
              className="text-ink-900 underline underline-offset-4 hover:text-champagne-600 transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
