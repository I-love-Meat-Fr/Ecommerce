import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useState, useEffect } from 'react'
import { Search, X, ShoppingBag, User, LogOut, Menu } from 'lucide-react'

const navigation = [
  { name: 'Trang chủ', href: '/' },
  { name: 'Bộ Sưu Tập', href: '/san-pham' },
  { name: 'Cây Giống', href: '/san-pham?category=cay-giong' },
  { name: 'Hoa Đồng Tiền', href: '/san-pham?category=hoa-dong-tien' },
  { name: 'Câu Chuyện', href: '/about' },
  { name: 'Liên Hệ', href: '/contact' },
]

function Header({ onMenuClick }) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const cartItems = useCartStore(state => state.items)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated())
  const user = useAuthStore(state => state.user)
  const logout = useAuthStore(state => state.logout)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isAccountOpen) return
    const handleClick = (e) => {
      if (!e.target.closest('[data-account-menu]')) setIsAccountOpen(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [isAccountOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/san-pham?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsSearchOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    setIsAccountOpen(false)
    navigate('/')
  }

  return (
    <>
      {/* Top utility bar - announcement marquee */}
      <div className="bg-ink-900 text-ivory-100 py-2 overflow-hidden">
        <div className="marquee">
          <div className="marquee-track">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="text-[11px] tracking-editorial uppercase font-medium whitespace-nowrap flex items-center gap-12">
                <span>Miễn phí vận chuyển cho đơn từ 1.000.000đ</span>
                <span className="text-champagne-300">◆</span>
                <span>Tư vấn thiết kế cảnh quan miễn phí</span>
                <span className="text-champagne-300">◆</span>
                <span>Bảo hành sức sống 30 ngày</span>
                <span className="text-champagne-300">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-ivory-50/95 backdrop-blur-md shadow-soft' : 'bg-ivory-50'
      }`}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Mobile menu */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-2 text-ink-900 hover:text-champagne-500 transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Left nav - desktop */}
            <nav className="hidden lg:flex items-center gap-10 flex-1">
              {navigation.slice(0, 3).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="link-editorial text-[12px]"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Center logo */}
            <Link to="/" className="flex flex-col items-center gap-0.5 group">
              <span className="font-display text-2xl md:text-3xl tracking-tight text-ink-900">
                Florist
              </span>
              <span className="text-[10px] tracking-widest uppercase text-champagne-500 font-medium">
                Vietnam · Est. 2014
              </span>
            </Link>

            {/* Right nav - desktop */}
            <nav className="hidden lg:flex items-center gap-10 flex-1 justify-end">
              {navigation.slice(3).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="link-editorial text-[12px]"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 lg:gap-3 ml-auto lg:ml-0">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="input-editorial w-32 md:w-48 py-2 text-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 text-ink-600 hover:text-ink-900 transition-colors"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-ink-900 hover:text-champagne-500 transition-colors"
                  aria-label="Tìm kiếm"
                >
                  <Search className="w-5 h-5" strokeWidth={1.5} />
                </button>
              )}

              {isAuthenticated ? (
                <div className="relative hidden md:block" data-account-menu>
                  <button
                    onClick={() => setIsAccountOpen((v) => !v)}
                    className="p-2 text-ink-900 hover:text-champagne-500 transition-colors"
                    aria-label="Tài khoản"
                    aria-expanded={isAccountOpen}
                  >
                    <User className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                  {isAccountOpen && (
                    <div className="absolute right-0 top-full mt-3 w-56 bg-ivory-50 border border-ivory-300 shadow-soft py-2 z-50">
                      <div className="px-4 py-3 border-b border-ivory-300">
                        <p className="text-[11px] tracking-[0.2em] uppercase text-ink-500">
                          Đã đăng nhập
                        </p>
                        <p className="text-sm text-ink-900 truncate">
                          {user?.fullName || user?.email}
                        </p>
                      </div>
                      <Link
                        to="/account"
                        onClick={() => setIsAccountOpen(false)}
                        className="block px-4 py-2 text-sm text-ink-900 hover:bg-ivory-100 transition-colors"
                      >
                        Tài khoản của tôi
                      </Link>
                      {user?.role === 'Admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsAccountOpen(false)}
                          className="block px-4 py-2 text-sm text-ink-900 hover:bg-ivory-100 transition-colors"
                        >
                          Quản trị
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-ink-900 hover:bg-ivory-100 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" strokeWidth={1.5} />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:block p-2 text-ink-900 hover:text-champagne-500 transition-colors"
                  aria-label="Đăng nhập"
                >
                  <User className="w-5 h-5" strokeWidth={1.5} />
                </Link>
              )}

              <Link
                to="/cart"
                className="relative p-2 text-ink-900 hover:text-champagne-500 transition-colors"
                aria-label="Giỏ hàng"
              >
                <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-champagne-500 text-ivory-50 text-[10px] font-medium rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
        <div className="divider-thin" />
      </header>
    </>
  )
}

export default Header