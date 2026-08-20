import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

function AccountPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="bg-ivory-50 min-h-[calc(100vh-200px)] py-20 md:py-28">
      <div className="container-narrow">
        <div className="max-w-2xl mx-auto">
          <p className="eyebrow text-center mb-4">— Tài khoản</p>
          <h1 className="font-display text-4xl md:text-5xl text-ink-900 text-center mb-12">
            Xin chào, {user?.fullName || 'bạn'}
          </h1>

          <div className="card-editorial p-8 md:p-10">
            <div className="space-y-6">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-ink-500 mb-1">
                  Email
                </p>
                <p className="text-ink-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-ink-500 mb-1">
                  Họ và tên
                </p>
                <p className="text-ink-900">{user?.fullName}</p>
              </div>
            </div>

            <div className="divider-thin my-10" />

            <p className="text-sm text-ink-600 font-light mb-6">
              Lịch sử đơn hàng và thông tin giao hàng sẽ sớm được cập nhật tại đây.
            </p>

            <button onClick={handleLogout} className="btn-luxury-outline">
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountPage
