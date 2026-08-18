import { Link } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Truck, Shield, RotateCcw } from 'lucide-react'

function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore()
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
  }

  const subtotal = getTotalPrice()
  const shipping = subtotal > 500000 ? 0 : 30000
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h1>
            <p className="text-gray-600 mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
            <Link to="/san-pham" className="btn-primary inline-block">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <ol className="flex items-center gap-2 text-gray-600">
            <li><Link to="/" className="hover:text-primary-600">Trang chủ</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">Giỏ hàng</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng ({items.length} sản phẩm)</h1>
              <button 
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Xóa tất cả
              </button>
            </div>

            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex gap-4">
                  {/* Image */}
                  <Link to={`/san-pham/${item.product.slug || item.product._id}`}>
                    <img
                      src={item.product.imageUrl || 'https://via.placeholder.com/120'}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <Link 
                          to={`/san-pham/${item.product.slug || item.product._id}`}
                          className="font-semibold text-gray-900 hover:text-primary-600"
                        >
                          {item.product.name}
                        </Link>
                        {item.variant && (
                          <p className="text-sm text-gray-500">{item.variant.name}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-primary-600">
                          {formatPrice((item.variant?.price || 0) * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-gray-500">
                            {formatPrice(item.variant?.price || 0)} / sản phẩm
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link 
              to="/san-pham" 
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Tiếp tục mua sắm
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span>{shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-sm text-primary-600 bg-primary-50 p-2 rounded-lg">
                    Mua thêm {formatPrice(500000 - subtotal)} để được miễn phí giao hàng!
                  </p>
                )}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Tổng cộng</span>
                  <span className="text-primary-600">{formatPrice(total)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">(Đã bao gồm VAT)</p>
              </div>

              <button className="w-full btn-primary mb-4">
                Tiến hành thanh toán
              </button>

              {/* Benefits */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="w-5 h-5 text-primary-600" />
                  <span>Giao hàng nhanh 24-48h</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-primary-600" />
                  <span>Bảo hành 30 ngày</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <RotateCcw className="w-5 h-5 text-primary-600" />
                  <span>Đổi trả miễn phí</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
