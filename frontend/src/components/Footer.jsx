import { Link } from 'react-router-dom'
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = {
  collection: [
    { name: 'Cây Giống Hoa', href: '/san-pham?category=cay-giong' },
    { name: 'Hoa Đồng Tiền', href: '/san-pham/hoa-dong-tien' },
    { name: 'Lan Ý', href: '/san-pham/lan-y' },
    { name: 'Monstera', href: '/san-pham/monstera-deliciosa' },
    { name: 'Quà Tặng', href: '/san-pham?category=qua-tang' },
  ],
  maison: [
    { name: 'Câu Chuyện', href: '/gioi-thieu' },
    { name: 'Hệ Thống Cửa Hàng', href: '/he-thong-cua-hang' },
    { name: 'Tạp Chí', href: '/kinh-nghiem' },
    { name: 'Tuyển Dụng', href: '/tuyen-dung' },
  ],
  services: [
    { name: 'Chính Sách Giao Hàng', href: '/chinh-sach-giao-hang' },
    { name: 'Chính Sách Đổi Trả', href: '/chinh-sach-doi-tra' },
    { name: 'Hướng Dẫn Mua Hàng', href: '/huong-dan-mua-hang' },
    { name: 'Câu Hỏi Thường Gặp', href: '/faq' },
  ],
}

function Footer() {
  return (
    <footer className="bg-ink-900 text-ivory-100">
      {/* Newsletter section */}
      <div className="border-b border-ink-700">
        <div className="container-custom py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="eyebrow mb-4">— Bản Tin</p>
              <h3 className="font-display text-3xl md:text-4xl text-ivory-50 leading-tight">
                Nhận những câu chuyện <em className="text-champagne-300">&</em> bộ sưu tập mới nhất
              </h3>
            </div>
            <form className="flex gap-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Địa chỉ email của bạn"
                className="flex-1 bg-transparent border-b border-ivory-100/30 py-3 text-ivory-50 placeholder-ivory-100/40 focus:border-champagne-300 outline-none transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-champagne-400 hover:bg-champagne-300 text-ink-900 text-xs tracking-editorial uppercase font-medium transition-colors"
              >
                Đăng Ký
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-custom py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 space-y-6">
            <Link to="/" className="block">
              <span className="font-display text-3xl text-ivory-50 block">Florist</span>
              <span className="text-[10px] tracking-widest uppercase text-champagne-400 font-medium">
                Vietnam · Est. 2014
              </span>
            </Link>
            <p className="text-ivory-100/70 text-sm leading-relaxed max-w-xs font-light">
              Maison chuyên về cây giống hoa & cây cảnh nghệ thuật. 
              Nơi thiên nhiên gặp gỡ sự tinh tế trong từng chi tiết.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="https://facebook.com/vietflorist" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-ivory-100/20 hover:border-champagne-400 hover:text-champagne-400 flex items-center justify-center transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" strokeWidth={1.5} />
              </a>
              <a href="https://instagram.com/florist_vietnam" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-ivory-100/20 hover:border-champagne-400 hover:text-champagne-400 flex items-center justify-center transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" strokeWidth={1.5} />
              </a>
              <a href="https://youtube.com/@floristvietnam9941" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-ivory-100/20 hover:border-champagne-400 hover:text-champagne-400 flex items-center justify-center transition-colors" aria-label="YouTube">
                <Youtube className="w-4 h-4" strokeWidth={1.5} />
              </a>
              <a href="https://zalo.me/0818596696" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-ivory-100/20 hover:border-champagne-400 hover:text-champagne-400 flex items-center justify-center transition-colors" aria-label="Zalo">
                <span className="font-display text-base">Z</span>
              </a>
            </div>
          </div>

          {/* Links - Collection */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-[10px] tracking-widest uppercase text-champagne-400 font-semibold mb-5">Bộ Sưu Tập</h4>
            <ul className="space-y-3">
              {footerLinks.collection.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-ivory-100/70 hover:text-ivory-50 transition-colors font-light">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links - Maison */}
          <div className="col-span-1 md:col-span-3">
            <h4 className="text-[10px] tracking-widest uppercase text-champagne-400 font-semibold mb-5">Maison</h4>
            <ul className="space-y-3">
              {footerLinks.maison.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-ivory-100/70 hover:text-ivory-50 transition-colors font-light">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links - Services */}
          <div className="col-span-1 md:col-span-3">
            <h4 className="text-[10px] tracking-widest uppercase text-champagne-400 font-semibold mb-5">Dịch Vụ</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-ivory-100/70 hover:text-ivory-50 transition-colors font-light">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact strip */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 pt-10 border-t border-ink-700">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 mt-1 text-champagne-400 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-[10px] tracking-widest uppercase text-ivory-100/50 mb-1">Địa Chỉ</p>
              <p className="text-sm font-light">23 Thung Lũng Mùa Xuân, KĐT Ecopark, Văn Giang, Hưng Yên</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 mt-1 text-champagne-400 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-[10px] tracking-widest uppercase text-ivory-100/50 mb-1">Liên Hệ</p>
              <a href="tel:0818596696" className="text-sm font-light hover:text-champagne-400 transition-colors">0818 596 696</a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 mt-1 text-champagne-400 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-[10px] tracking-widest uppercase text-ivory-100/50 mb-1">Email</p>
              <a href="mailto:floristviet@gmail.com" className="text-sm font-light hover:text-champagne-400 transition-colors">floristviet@gmail.com</a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-ink-700">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-ivory-100/50">
            <p>© 2024 Florist Vietnam. <span className="font-light">Bảo lưu mọi quyền.</span></p>
            <div className="flex gap-6">
              <Link to="/chinh-sach-bao-mat" className="hover:text-ivory-50 transition-colors font-light">Chính sách bảo mật</Link>
              <Link to="/dieu-khoan-su-dung" className="hover:text-ivory-50 transition-colors font-light">Điều khoản sử dụng</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer