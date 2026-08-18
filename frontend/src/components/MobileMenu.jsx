import { Link } from 'react-router-dom'
import { X } from 'lucide-react'

const navigation = [
  { name: 'Trang chủ', href: '/' },
  { name: 'Sản phẩm', href: '/san-pham' },
  { name: 'Cây giống', href: '/san-pham?category=cay-giong' },
  { name: 'Khuyến mãi', href: '/san-pham?category=hot-deal' },
  { name: 'Kinh nghiệm', href: '/kinh-nghiệm' },
  { name: 'Giới thiệu', href: '/gioi-thieu' },
  { name: 'Liên hệ', href: '/lien-he' },
]

function MobileMenu({ isOpen, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Menu panel */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-50 transform transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <img 
            src="https://florist.vn/wp-content/uploads/2020/10/logo-1.png" 
            alt="Florist Vietnam" 
            className="h-10"
          />
          <button 
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  onClick={onClose}
                  className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors font-medium"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Hotline</p>
            <a 
              href="tel:0818596696" 
              className="text-xl font-bold text-primary-600"
            >
              0818 596 696
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default MobileMenu
