import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import SafeImage from '../components/SafeImage'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Truck, ShieldCheck, RotateCcw, ArrowRight } from 'lucide-react'

function CartPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore()
  
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' ₫'

  const subtotal = getTotalPrice()
  const shipping = subtotal > 500000 ? 0 : 30000
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="bg-ivory-50 min-h-screen">
        <div className="container-custom py-20 md:py-32">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 border border-ink-900 mx-auto mb-10 flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-ink-900" strokeWidth={1} />
            </div>
            <p className="section-number mb-4">— Giỏ Hàng Trống</p>
            <h1 className="font-display text-display-lg text-ink-900 mb-6">
              Không có sản phẩm <em className="italic">nào</em>
            </h1>
            <p className="text-ink-500 font-light mb-10">
              Hãy khám phá bộ sưu tập cây cảnh của chúng tôi để tìm cho mình những sản phẩm ưng ý.
            </p>
            <Link to="/san-pham" className="btn-luxury">
              Khám Phá Bộ Sưu Tập
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-ivory-50">
      <section className="pt-12 pb-10">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-[11px] tracking-widest uppercase mb-10">
            <Link to="/" className="text-ink-500 hover:text-ink-900 transition-colors">Trang Chủ</Link>
            <span className="text-ink-300">/</span>
            <span className="text-ink-900 font-medium">Giỏ Hàng</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="section-number mb-4">— Giỏ Hàng Của Bạn</p>
              <h1 className="font-display text-display-lg text-ink-900">
                Lựa chọn <em className="italic">tuyệt vời</em>
              </h1>
            </div>
            <button 
              onClick={clearCart}
              className="text-[11px] tracking-widest uppercase text-ink-500 hover:text-ink-900 transition-colors underline underline-offset-4 self-start md:self-end"
            >
              Xóa tất cả
            </button>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="container-custom">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Cart Items */}
            <div className="lg:col-span-8">
              <div className="space-y-px bg-ivory-300">
                {items.map((item, i) => (
                  <div key={item.id} className="bg-ivory-50 p-6 md:p-8 group">
                    <div className="flex gap-5 md:gap-6">
                      <span className="section-number mt-2">
                        № {String(i + 1).padStart(2, '0')}
                      </span>
                      
                      <Link to={`/san-pham/${item.product.id}-${encodeURIComponent(item.variant?.sku || '')}`} className="flex-shrink-0 w-24 h-32 md:w-32 md:h-40 overflow-hidden bg-ivory-200 hover-zoom">
                        <SafeImage
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fallbackSeed={item.product.id || item.product.name}
                          imgClassName="w-full h-full object-cover"
                        />
                      </Link>

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="flex justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              to={`/san-pham/${item.product.id}-${encodeURIComponent(item.variant?.sku || '')}`}
                              className="font-display text-xl md:text-2xl text-ink-900 hover:text-champagne-500 transition-colors block truncate"
                            >
                              {item.product.name}
                            </Link>
                            {item.variant && (
                              <p className="text-[10px] tracking-widest uppercase text-ink-500 mt-1 font-medium">
                                {item.variant.name}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-ink-400 hover:text-red-500 transition-colors flex-shrink-0"
                            aria-label="Xóa"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>

                        <div className="flex items-end justify-between gap-4 mt-4">
                          <div className="inline-flex items-center border border-ivory-300">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-ivory-100 transition-colors"
                            >
                              <Minus className="w-3 h-3" strokeWidth={1.5} />
                            </button>
                            <span className="w-10 text-center font-display text-base">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-ivory-100 transition-colors"
                            >
                              <Plus className="w-3 h-3" strokeWidth={1.5} />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="font-display text-xl text-ink-900">
                              {formatPrice((item.variant?.price || 0) * item.quantity)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-ink-400 mt-1 font-light">
                                {formatPrice(item.variant?.price || 0)} / sp
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link to="/san-pham" className="link-editorial">
                  <ArrowLeft className="w-3 h-3" strokeWidth={2} />
                  Tiếp tục khám phá
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32 border border-ivory-300 p-8 bg-ivory-50">
                <p className="section-number mb-3">— Tổng Quan</p>
                <h2 className="font-display text-2xl text-ink-900 mb-8">Đơn hàng</h2>
                
                <div className="space-y-4 pb-6 border-b border-ivory-300 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-500 font-light">Tạm tính ({items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm)</span>
                    <span className="text-ink-900 font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-500 font-light">Vận chuyển</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-champagne-500' : 'text-ink-900'}`}>
                      {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-champagne-500 italic">
                      Mua thêm {formatPrice(500000 - subtotal)} để được miễn phí giao hàng
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-baseline mb-8">
                  <span className="font-display text-lg text-ink-900">Tổng cộng</span>
                  <span className="font-display text-3xl text-ink-900">
                    {formatPrice(total)}
                  </span>
                </div>
                <p className="text-[10px] tracking-widest uppercase text-ink-500 -mt-6 mb-8">Đã bao gồm VAT</p>

                <button
                  onClick={() => {
                    if (!isAuthenticated()) {
                      navigate('/login', { state: { from: { pathname: '/checkout' } } })
                    } else {
                      navigate('/checkout')
                    }
                  }}
                  className="w-full btn-luxury mb-3"
                >
                  Tiến Hành Thanh Toán
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </button>

                <div className="space-y-3 pt-6 border-t border-ivory-300 mt-6">
                  {[
                    { icon: Truck, text: 'Giao hàng 24-48h toàn quốc' },
                    { icon: ShieldCheck, text: 'Bảo hành sức sống 30 ngày' },
                    { icon: RotateCcw, text: 'Đổi trả miễn phí trong 7 ngày' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-champagne-500" strokeWidth={1.5} />
                      <span className="text-xs text-ink-600 font-light">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CartPage