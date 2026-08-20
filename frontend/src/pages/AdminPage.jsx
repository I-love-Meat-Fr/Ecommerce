import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

function AdminPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
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
            <div className="card-editorial p-8 hover:border-ink-900">
              <p className="eyebrow mb-3">Quản lý</p>
              <h3 className="font-display text-2xl text-ink-900 mb-4">Sản phẩm</h3>
              <p className="text-sm text-ink-600 font-light mb-6">
                Thêm, sửa, xóa sản phẩm trong cửa hàng.
              </p>
              <span className="badge-editorial">Sắp ra mắt</span>
            </div>

            <div className="card-editorial p-8 hover:border-ink-900">
              <p className="eyebrow mb-3">Quản lý</p>
              <h3 className="font-display text-2xl text-ink-900 mb-4">Đơn hàng</h3>
              <p className="text-sm text-ink-600 font-light mb-6">
                Theo dõi và cập nhật trạng thái đơn hàng.
              </p>
              <span className="badge-editorial">Sắp ra mắt</span>
            </div>

            <div className="card-editorial p-8 hover:border-ink-900">
              <p className="eyebrow mb-3">Quản lý</p>
              <h3 className="font-display text-2xl text-ink-900 mb-4">Người dùng</h3>
              <p className="text-sm text-ink-600 font-light mb-6">
                Quản lý tài khoản khách hàng.
              </p>
              <span className="badge-editorial">Sắp ra mắt</span>
            </div>

            <div className="card-editorial p-8 hover:border-ink-900">
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

export default AdminPage
