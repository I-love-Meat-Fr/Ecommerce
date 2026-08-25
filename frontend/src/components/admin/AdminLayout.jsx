import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { push } from './Toast'

const navItems = [
  { label: 'Sản phẩm', to: '/admin/products', icon: '◧' },
  { label: 'Đơn hàng', to: '/admin/orders', icon: '◇' },
  { label: 'Người dùng', to: '/admin/users', icon: '◯' },
]

export default function AdminLayout({ children }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    push('Đã đăng xuất', 'info')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-ivory-50 flex">
      <aside className="w-60 shrink-0 bg-ink-900 text-ivory-100 flex flex-col">
        <div className="px-5 py-5 border-b border-ink-700">
          <p className="text-[10px] tracking-widest uppercase text-ink-400 font-mono mb-1">Admin</p>
          <p className="font-display text-2xl text-ivory-50 leading-tight">Bảng điều khiển</p>
        </div>

        <nav className="flex-1 py-3">
          {navItems.map((item) =>
            item.disabled ? (
              <div
                key={item.to}
                className="px-5 py-2.5 text-sm text-ink-500 cursor-not-allowed flex items-center gap-3"
                title="Sắp ra mắt"
              >
                <span className="font-mono text-base w-4">{item.icon}</span>
                <span>{item.label}</span>
                <span className="ml-auto text-[10px] uppercase tracking-wider text-ink-600">Soon</span>
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-5 py-2.5 text-sm flex items-center gap-3 border-l-2 transition-colors ${
                    isActive
                      ? 'bg-ink-800 border-sage-400 text-ivory-50'
                      : 'border-transparent text-ivory-200 hover:bg-ink-800 hover:text-ivory-50'
                  }`
                }
              >
                <span className="font-mono text-base w-4">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            )
          )}
        </nav>

        <div className="px-5 py-4 border-t border-ink-700 text-xs">
          <p className="text-ivory-50 font-medium truncate">{user?.fullName}</p>
          <p className="text-ink-400 font-mono text-[11px] truncate mb-3">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="w-full text-left text-ink-300 hover:text-ivory-50 transition-colors"
          >
            ← Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">{children}</main>
    </div>
  )
}