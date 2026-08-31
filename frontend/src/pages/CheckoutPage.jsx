import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { orderApi } from '../services/api'
import { push } from '../components/admin/Toast'
import SafeImage from '../components/SafeImage'
import { ArrowLeft, Package, Truck, ShieldCheck, RotateCcw, CheckCircle } from 'lucide-react'

const PAYMENT_METHODS = [
  {
    id: 'COD',
    label: 'Thanh toán khi nhận hàng (COD)',
    desc: 'Trả tiền mặt cho nhân viên giao hàng khi nhận được đơn.',
    icon: Package,
  },
  {
    id: 'Online',
    label: 'Thanh toán trực tuyến',
    desc: 'Thanh toán qua ví điện tử, thẻ ATM, hoặc thẻ quốc tế (VNPay).',
    icon: ShieldCheck,
  },
]

const STATUS_LABELS = {
  Pending: { label: 'Chờ xác nhận', cls: 'bg-amber-50 border-amber-400 text-amber-700' },
  Processing: { label: 'Đang xử lý', cls: 'bg-blue-50 border-blue-400 text-blue-700' },
  Shipped: { label: 'Đang giao', cls: 'bg-indigo-50 border-indigo-400 text-indigo-700' },
  Delivered: { label: 'Đã giao', cls: 'bg-green-50 border-green-400 text-green-700' },
  Cancelled: { label: 'Đã hủy', cls: 'bg-red-50 border-red-400 text-red-700' },
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + ' ₫'
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuthStore()
  const { items, getTotalPrice, clearCart } = useCartStore()

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    note: '',
    paymentMethod: 'COD',
  })
  const [addressRequired, setAddressRequired] = useState(false)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)

  const subtotal = getTotalPrice()
  const shipping = subtotal >= 500000 ? 0 : 30000
  const total = subtotal + shipping

  useEffect(() => {
    refreshUser()
  }, [])

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        fullName: user.fullName || '',
        phone: user.phone || '',
        address: user.address || '',
      }))
      if (!user.address?.trim()) {
        setAddressRequired(true)
      }
    }
  }, [user])

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }))
    if (field === 'address') setAddressRequired(false)
  }

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ và tên'
    if (!form.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại'
    if (!form.address.trim()) e.address = 'Vui lòng nhập địa chỉ giao hàng'
    setErrors(e)
    if (Object.keys(e).length) {
      if (e.address) setAddressRequired(true)
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setBusy(true)
    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.product.id,
          variantId: item.variant?.sku || item.variant?.name || '',
          quantity: item.quantity,
        })),
        paymentMethod: form.paymentMethod,
        shippingAddress: form.address.trim(),
      }
      const order = await orderApi.create(payload)
      clearCart()
      setOrderSuccess(order)
      push('Đặt hàng thành công!', 'success')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.'
      push(msg, 'error')
    } finally {
      setBusy(false)
    }
  }

  if (orderSuccess) {
    const statusInfo = STATUS_LABELS[orderSuccess.status] || STATUS_LABELS.Pending
    return (
      <div className="bg-ivory-50 min-h-screen">
        <div className="container-custom py-20 md:py-28">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" strokeWidth={1.5} />
            </div>
            <p className="eyebrow mb-3">— Đặt hàng thành công</p>
            <h1 className="font-display text-3xl md:text-4xl text-ink-900 mb-3">
              Cảm ơn bạn đã đặt hàng!
            </h1>
            <p className="text-ink-600 font-light mb-6">
              Mã đơn hàng của bạn là <strong className="font-mono">{orderSuccess.id}</strong>
            </p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 border rounded-xs text-sm font-medium ${statusInfo.cls}`}>
              {statusInfo.label}
            </div>
            <div className="mt-8 space-y-3">
              <button onClick={() => navigate('/account')} className="btn-luxury w-full">
                Xem đơn hàng của tôi
              </button>
              <Link to="/san-pham" className="btn-luxury-outline w-full block text-center">
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-ivory-50 min-h-screen">
        <div className="container-custom py-20 text-center">
          <p className="eyebrow mb-3">— Giỏ hàng trống</p>
          <h1 className="font-display text-3xl text-ink-900 mb-6">Không có sản phẩm nào để đặt</h1>
          <Link to="/san-pham" className="btn-luxury">
            Khám phá sản phẩm
          </Link>
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
            <Link to="/cart" className="text-ink-500 hover:text-ink-900 transition-colors">Giỏ Hàng</Link>
            <span className="text-ink-300">/</span>
            <span className="text-ink-900 font-medium">Xác Nhận Đơn Hàng</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="section-number mb-4">— Xác nhận đơn hàng</p>
              <h1 className="font-display text-display-lg text-ink-900">
                Thông tin <em className="italic">thanh toán</em>
              </h1>
            </div>
            <Link to="/cart" className="link-editorial">
              <ArrowLeft className="w-3 h-3" strokeWidth={2} />
              Quay lại giỏ hàng
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="container-custom">
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Left: Customer Info + Payment */}
            <div className="lg:col-span-7 space-y-6">
              {/* Thông tin giao hàng */}
              <div className="card-editorial p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="w-5 h-5 text-champagne-500" strokeWidth={1.5} />
                  <h2 className="font-display text-2xl text-ink-900">Thông tin giao hàng</h2>
                </div>

                {addressRequired && (
                  <div className="mb-5 p-4 border border-amber-300 bg-amber-50 rounded-xs text-sm text-amber-700">
                    Vui lòng cập nhật địa chỉ giao hàng để tiếp tục đặt hàng.
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2">
                      Họ và tên người nhận
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => update('fullName', e.target.value)}
                      className={`input-editorial ${errors.fullName ? 'border-red-400' : ''}`}
                      placeholder="Nhập họ và tên"
                    />
                    {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      className={`input-editorial ${errors.phone ? 'border-red-400' : ''}`}
                      placeholder="0xxx xxx xxx"
                    />
                    {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2">
                      Địa chỉ giao hàng <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={form.address}
                      onChange={(e) => update('address', e.target.value)}
                      className={`input-editorial resize-none ${errors.address ? 'border-red-400' : ''}`}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    />
                    {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2">
                      Ghi chú đơn hàng <span className="text-ink-400">(tùy chọn)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={form.note}
                      onChange={(e) => update('note', e.target.value)}
                      className="input-editorial resize-none"
                      placeholder="Ví dụ: Giao vào giờ hành chính, gọi trước khi giao..."
                    />
                  </div>
                </div>
              </div>

              {/* Phương thức thanh toán */}
              <div className="card-editorial p-8">
                <h2 className="font-display text-2xl text-ink-900 mb-6">Phương thức thanh toán</h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon
                    const selected = form.paymentMethod === method.id
                    return (
                      <label
                        key={method.id}
                        className={`flex items-start gap-4 p-5 border rounded-xs cursor-pointer transition-all ${
                          selected
                            ? 'border-ink-900 bg-ink-50'
                            : 'border-ivory-300 bg-ivory-50 hover:border-ink-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selected}
                          onChange={() => update('paymentMethod', method.id)}
                          className="mt-1 accent-ink-900"
                        />
                        <Icon
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${selected ? 'text-ink-900' : 'text-ink-400'}`}
                          strokeWidth={1.5}
                        />
                        <div>
                          <p className={`font-display text-base ${selected ? 'text-ink-900' : 'text-ink-800'}`}>
                            {method.label}
                          </p>
                          <p className="text-xs text-ink-500 font-light mt-1">{method.desc}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-32 border border-ivory-300 p-8 bg-ivory-50">
                <p className="section-number mb-3">— Tóm tắt</p>
                <h2 className="font-display text-2xl text-ink-900 mb-6">Đơn hàng</h2>

                <div className="space-y-4 pb-5 border-b border-ivory-300 mb-5">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 border border-ivory-300 bg-white flex-shrink-0 overflow-hidden">
                        <SafeImage
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fallbackSeed={item.product.id || item.product.name}
                          imgClassName="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm text-ink-900 truncate">{item.product.name}</p>
                        {item.variant && (
                          <p className="text-[10px] text-ink-500 uppercase tracking-wide">{item.variant.name}</p>
                        )}
                        <p className="text-xs text-ink-600 mt-1">
                          {item.quantity} × {formatPrice(item.variant?.price || 0)}
                        </p>
                      </div>
                      <p className="font-display text-sm text-ink-900 whitespace-nowrap">
                        {formatPrice((item.variant?.price || 0) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pb-5 border-b border-ivory-300 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-500 font-light">Tạm tính</span>
                    <span className="text-ink-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-500 font-light">Vận chuyển</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-champagne-500' : 'text-ink-900'}`}>
                      {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline mb-8">
                  <span className="font-display text-lg text-ink-900">Tổng cộng</span>
                  <span className="font-display text-3xl text-ink-900">{formatPrice(total)}</span>
                </div>
                <p className="text-[10px] tracking-widest uppercase text-ink-500 -mt-6 mb-8">
                  Đã bao gồm VAT
                </p>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full btn-luxury disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {busy ? 'Đang xử lý...' : 'Đặt Hàng Ngay'}
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
          </form>
        </div>
      </section>
    </div>
  )
}
