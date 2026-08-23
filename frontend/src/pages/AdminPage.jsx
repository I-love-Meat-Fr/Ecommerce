import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { push } from '../components/admin/Toast'

const tiles = [
  {
    title: 'Sản phẩm',
    desc: 'Thêm, sửa, xóa sản phẩm và biến thể.',
    to: '/admin/products',
    ready: true,
  },
  {
    title: 'Đơn hàng',
    desc: 'Theo dõi và cập nhật trạng thái đơn hàng.',
    ready: false,
  },
  {
    title: 'Người dùng',
    desc: 'Quản lý tài khoản khách hàng.',
    ready: false,
  },
]

export default function AdminPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    push('Đã đăng xuất', 'info')
    navigate('/')
  }

  return (
    <div className="bg-ivory-50 min-h-[calc(100vh-200px)] py-20 md:py-28">
      <div className="container-narrow">
        <div className="max-w-3xl mx-auto">
          <p className="eyebrow text-center mb-4">— Administration</p>
          <h1 className="font-display text-4xl md:text-5xl text-ink-900 text-center mb-3">
            Admin Panel
          </h1>
          <p className="text-center text-ink-600 font-light mb-12">
            Chào, <strong>{user?.fullName}</strong> · {user?.email}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tiles.map((t) =>
              t.ready ? (
                <Link
                  key={t.title}
                  to={t.to}
                  className="card-editorial p-8 hover:border-ink-900 hover:bg-white block"
                >
                  <p className="eyebrow mb-3">Quản lý</p>
                  <h3 className="font-display text-2xl text-ink-900 mb-4">{t.title}</h3>
                  <p className="text-sm text-ink-600 font-light mb-6">{t.desc}</p>
                  <span className="text-xs uppercase tracking-widest text-sage-600 font-mono">
                    Mở →
                  </span>
                </Link>
              ) : (
                <div
                  key={t.title}
                  className="card-editorial p-8 cursor-not-allowed opacity-60"
                >
                  <p className="eyebrow mb-3">Quản lý</p>
                  <h3 className="font-display text-2xl text-ink-900 mb-4">{t.title}</h3>
                  <p className="text-sm text-ink-600 font-light mb-6">{t.desc}</p>
                  <span className="badge-editorial">Sắp ra mắt</span>
                </div>
              )
            )}

            <div className="card-editorial p-8 cursor-not-allowed opacity-60">
              <p className="eyebrow mb-3">Quản lý</p>
              <h3 className="font-display text-2xl text-ink-900 mb-4">Bài viết</h3>
              <p className="text-sm text-ink-600 font-light mb-6">
                Quản lý blog và nội dung cửa hàng.
              </p>
              <span className="badge-editorial">Sắp ra mắt</span>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button onClick={handleLogout} className="btn-luxury-outline">
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}