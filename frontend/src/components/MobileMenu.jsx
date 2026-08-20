import { Link } from 'react-router-dom'
import { X, ArrowUpRight } from 'lucide-react'

const navigation = [
  { name: 'Trang chủ', href: '/' },
  { name: 'Bộ Sưu Tập', href: '/san-pham' },
  { name: 'Cây Giống Hoa', href: '/san-pham?category=cay-giong' },
  { name: 'Hoa Đồng Tiền', href: '/san-pham?category=hoa-dong-tien' },
  { name: 'Câu Chuyện', href: '/gioi-thieu' },
  { name: 'Tạp Chí', href: '/kinh-nghiem' },
  { name: 'Liên Hệ', href: '/lien-he' },
]

function MobileMenu({ isOpen, onClose }) {
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
              {navigation.map((item, i) => (
                <li 
                  key={item.name}
                  style={{ transitionDelay: `${i * 60}ms` }}
                  className={`${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'} transition-all duration-700 ease-out-expo`}
                >
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className="group flex items-center justify-between py-3 font-display text-3xl text-ink-900 hover:text-champagne-500 transition-colors"
                  >
                    <span>{item.name}</span>
                    <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" strokeWidth={1.5} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-8 border-t border-ivory-300 bg-ivory-100">
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