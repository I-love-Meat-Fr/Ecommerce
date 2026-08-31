import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useState, useEffect } from 'react'
import { X, ArrowUpRight, LogOut } from 'lucide-react'
import { categoryApi } from '../services/api'

const staticNavigation = [
  { name: 'Trang chủ', href: '/' },
  { name: 'Bộ Sưu Tập', href: '/san-pham' },
  { name: 'Câu Chuyện', href: '/about' },
  { name: 'Tạp Chí', href: '/blog' },
  { name: 'Liên Hệ', href: '/contact' },
]

function MobileMenu({ isOpen, onClose }) {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated())
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [categoryTree, setCategoryTree] = useState([])

  useEffect(() => {
    // Lazy load — the tree is small but we don't want to block the menu
    // opening. Failed loads simply omit the dynamic section.
    let cancelled = false
    categoryApi.getTree()
      .then((tree) => { if (!cancelled) setCategoryTree(tree || []) })
      .catch(() => { if (!cancelled) setCategoryTree([]) })
    return () => { cancelled = true }
  }, [])

  const handleLogout = () => {
    logout()
    onClose()
    navigate('/')
  }

  // Flatten the tree into link rows so each child has its own line and we
  // can stagger the animation cleanly. Indentation is conveyed by font size
  // (smaller for children) — no DOM-level padding hack.
  const treeLinks = []
  for (const root of categoryTree) {
    treeLinks.push({ name: root.name, href: `/san-pham?category=${encodeURIComponent(root.slug)}`, depth: 0 })
    for (const child of root.children || []) {
      treeLinks.push({ name: child.name, href: `/san-pham?category=${encodeURIComponent(child.slug)}`, depth: 1 })
    }
  }

  // Compose the full menu: static editorial labels first, then dynamic
  // category tree (only if loaded). Each item is one line so the animation
  // stagger stays readable.
  const navigation = [
    ...staticNavigation,
    ...treeLinks,
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-ink-900/60 z-50 transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Menu panel */}
      <div
        className={`fixed top-0 left-0 h-full w-full max-w-md bg-ivory-50 z-50 transform transition-transform duration-500 ease-out-expo ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-8">
            <Link to="/" onClick={onClose} className="block">
              <span className="font-display text-2xl text-ink-900 block">Florist</span>
              <span className="text-[10px] tracking-widest uppercase text-champagne-500 font-medium">
                Vietnam
              </span>
            </Link>
            <button
              onClick={onClose}
              className="p-2 text-ink-900 hover:text-champagne-500 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-6 h-6" strokeWidth={1.5} />
            </button>
          </div>

          <div className="divider-thin mx-8" />

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-8">
            <p className="eyebrow mb-6">— Menu</p>
            <ul className="space-y-2">
              {navigation.map((item, i) => {
                const isChild = item.depth === 1
                return (
                  <li
                    key={`${item.name}-${i}`}
                    style={{ transitionDelay: `${i * 40}ms` }}
                    className={`${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'} transition-all duration-700 ease-out-expo`}
                  >
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={`group flex items-center justify-between transition-colors ${
                        isChild
                          ? 'py-2 pl-6 font-body text-base text-ink-700 hover:text-ink-900'
                          : 'py-3 font-display text-3xl text-ink-900 hover:text-champagne-500'
                      }`}
                    >
                      <span>{item.name}</span>
                      <ArrowUpRight
                        className={`opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ${isChild ? 'w-3 h-3' : 'w-5 h-5'}`}
                        strokeWidth={1.5}
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-8 border-t border-ivory-300 bg-ivory-100">
            {isAuthenticated ? (
              <>
                <p className="eyebrow mb-3">— Tài khoản</p>
                <p className="font-display text-xl text-ink-900 mb-4">
                  {user?.fullName || user?.email}
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/account"
                    onClick={onClose}
                    className="link-editorial text-[12px]"
                  >
                    Tài khoản của tôi
                  </Link>
                  {user?.role === 'Admin' && (
                    <Link
                      to="/admin"
                      onClick={onClose}
                      className="link-editorial text-[12px]"
                    >
                      Quản trị
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="link-editorial text-[12px] inline-flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={1.5} />
                    Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="eyebrow mb-3">— Thành viên</p>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="link-editorial text-[12px]"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={onClose}
                    className="link-editorial text-[12px]"
                  >
                    Đăng ký
                  </Link>
                </div>
              </>
            )}
            <div className="divider-thin my-6" />
            <p className="eyebrow mb-3">— Hotline</p>
            <a
              href="tel:0818596696"
              className="font-display text-2xl text-ink-900 hover:text-champagne-500 transition-colors"
            >
              0818 596 696
            </a>
            <p className="text-xs text-ink-500 mt-2 font-light">Ecopark, Văn Giang, Hưng Yên</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default MobileMenu