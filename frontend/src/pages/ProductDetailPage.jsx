import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productApi } from '../services/api'
import { useCartStore } from '../store/cartStore'
import ProductCard from '../components/ProductCard'
import { Minus, Plus, Heart, Share2, Check, Truck, ShieldCheck, Leaf, ArrowRight } from 'lucide-react'

const sampleProduct = {
  _id: '1',
  name: 'Hoa Đồng Tiền Vàng Premium',
  slug: 'hoa-dong-tien-vang',
  description: 'Hoa đồng tiền vàng rực rỡ, dễ trồng và chăm sóc. Thích hợp cho ban công, sân vườn hoặc trang trí văn phòng. Cây có sức sống mạnh, ra hoa quanh năm, mang lại may mắn và tài lộc cho gia chủ.',
  category: 'Cây Giống',
  imageUrl: 'https://images.unsplash.com/photo-1526346698789-22fd84314424?w=1000',
  variants: [
    { sku: 'HDT-VANG-S', name: 'Nhỏ (15-20cm)', price: 150000, stock: 50 },
    { sku: 'HDT-VANG-M', name: 'Vừa (25-30cm)', price: 250000, stock: 30 },
    { sku: 'HDT-VANG-L', name: 'Lớn (35-40cm)', price: 380000, stock: 15 },
  ],
}

const relatedProducts = [
  { _id: '2', name: 'Hoa Đồng Tiền Đỏ', slug: 'hoa-dong-tien-do', imageUrl: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600', variants: [{ price: 280000, sku: 'HDT-DO-01' }] },
  { _id: '3', name: 'Hoa Đồng Tiền Cam', slug: 'hoa-dong-tien-cam', imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600', variants: [{ price: 260000, sku: 'HDT-CAM-01' }] },
  { _id: '4', name: 'Lan Ý Trắng', slug: 'lan-y-trang', imageUrl: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?w=600', variants: [{ price: 350000, sku: 'LY-TRANG-01' }] },
  { _id: '5', name: 'Monstera Deliciosa', slug: 'monstera-deliciosa', imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600', variants: [{ price: 450000, sku: 'MON-DEL-01' }] },
]

function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(sampleProduct)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addedToCart, setAddedToCart] = useState(false)
  
  const addItem = useCartStore(state => state.addItem)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const data = await productApi.getById(slug)
        if (data) setProduct(data)
      } catch (error) {
        // Keep sample
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  useEffect(() => {
    if (product.variants?.length > 0 && !selectedVariant) {
      setSelectedVariant(product.variants[1] || product.variants[0])
    }
  }, [product, selectedVariant])

  const handleAddToCart = () => {
    if (selectedVariant) {
      addItem(product, selectedVariant)
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2500)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: product.description, url: window.location.href })
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' ₫'

  if (loading) {
    return (
      <div className="bg-ivory-50 min-h-screen py-20">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="aspect-[4/5] shimmer" />
            <div className="space-y-6 pt-12">
              <div className="h-8 shimmer w-3/4" />
              <div className="h-12 shimmer w-1/2" />
              <div className="h-24 shimmer w-full" />
              <div className="h-14 shimmer w-2/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-ivory-50">
      {/* Breadcrumb */}
      <section className="pt-10 pb-6">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-[11px] tracking-widest uppercase">
            <Link to="/" className="text-ink-500 hover:text-ink-900 transition-colors">Trang Chủ</Link>
            <span className="text-ink-300">/</span>
            <Link to="/san-pham" className="text-ink-500 hover:text-ink-900 transition-colors">Bộ Sưu Tập</Link>
            <span className="text-ink-300">/</span>
            <span className="text-ink-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </section>

      {/* Product Detail */}
      <section className="pb-20 md:pb-28">
        <div className="container-custom">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Image column */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-12 gap-3 md:gap-4">
                <div className="col-span-12 aspect-[4/5] overflow-hidden bg-ivory-200 hover-zoom">
                  <img
                    src={product.imageUrl || 'https://via.placeholder.com/800'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="col-span-4 aspect-square overflow-hidden bg-ivory-200 hover-zoom">
                  <img src="https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="col-span-4 aspect-square overflow-hidden bg-ivory-200 hover-zoom">
                  <img src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="col-span-4 aspect-square overflow-hidden bg-ivory-200 hover-zoom">
                  <img src="https://images.unsplash.com/photo-1593691509543-c55fb32e7355?w=400" alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Info column */}
            <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
              <div className="space-y-8">
                <div>
                  <p className="section-number mb-4">— Mã: {selectedVariant?.sku || 'HDT-VANG-M'}</p>
                  <h1 className="font-display text-4xl md:text-5xl text-ink-900 leading-[1.05] mb-4">
                    {product.name}
                  </h1>
                  {product.category && (
                    <span className="text-[10px] tracking-widest uppercase text-champagne-500 font-semibold">
                      {product.category}
                    </span>
                  )}
                </div>

                {/* Price */}
                {selectedVariant && (
                  <div className="py-2 border-y border-ivory-300">
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-4xl text-ink-900">
                        {formatPrice(selectedVariant.price)}
                      </span>
                      <span className="text-xs text-ink-500">/ sản phẩm</span>
                    </div>
                  </div>
                )}

                {/* Description */}
                <p className="text-ink-600 leading-relaxed font-light">
                  {product.description}
                </p>

                {/* Variants */}
                {product.variants?.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-[10px] tracking-widest uppercase text-ink-900 font-semibold">
                        Kích Thước
                      </h3>
                      {selectedVariant && (
                        <span className="text-xs text-ink-500 font-light">
                          Còn {selectedVariant.stock} sản phẩm
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.sku}
                          onClick={() => setSelectedVariant(variant)}
                          className={`flex justify-between items-center p-4 border transition-all duration-300 ${
                            selectedVariant?.sku === variant.sku
                              ? 'border-ink-900 bg-ink-900 text-ivory-50'
                              : 'border-ivory-300 hover:border-ink-900 text-ink-900'
                          }`}
                        >
                          <span className="text-sm font-medium">{variant.name}</span>
                          <span className={`font-display text-base ${selectedVariant?.sku === variant.sku ? 'text-champagne-300' : 'text-ink-900'}`}>
                            {formatPrice(variant.price)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <h3 className="text-[10px] tracking-widest uppercase text-ink-900 font-semibold mb-4">
                    Số Lượng
                  </h3>
                  <div className="inline-flex items-center border border-ivory-300">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center hover:bg-ivory-100 transition-colors"
                    >
                      <Minus className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center bg-transparent focus:outline-none font-display text-lg"
                      min="1"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 flex items-center justify-center hover:bg-ivory-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant || selectedVariant.stock === 0}
                    className={`w-full btn-luxury ${addedToCart ? 'bg-champagne-500 border-champagne-500' : ''}`}
                  >
                    {addedToCart ? (
                      <>
                        <Check className="w-4 h-4" strokeWidth={1.5} />
                        Đã Thêm Vào Giỏ
                      </>
                    ) : (
                      <>
                        Thêm Vào Giỏ Hàng
                        <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                      </>
                    )}
                  </button>
                  
                  <div className="flex gap-3">
                    <button className="flex-1 btn-luxury-outline">
                      <Heart className="w-4 h-4" strokeWidth={1.5} />
                      Yêu Thích
                    </button>
                    <button
                      onClick={handleShare}
                      className="w-14 h-14 border border-ink-900 flex items-center justify-center hover:bg-ink-900 hover:text-ivory-50 transition-colors"
                    >
                      <Share2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Promises */}
                <div className="border-t border-ivory-300 pt-6 space-y-4">
                  {[
                    { icon: Truck, label: 'Miễn phí vận chuyển cho đơn từ 1.000.000đ' },
                    { icon: ShieldCheck, label: 'Bảo hành sức sống 30 ngày' },
                    { icon: Leaf, label: 'Tư vấn chăm sóc cây miễn phí' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-champagne-500" strokeWidth={1.5} />
                      <span className="text-xs text-ink-600 font-light">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="py-16 md:py-20 bg-ivory-100">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="section-number mb-3">— Có Thể Bạn Cũng Thích</p>
              <h2 className="font-display text-display-lg text-ink-900">
                Sản phẩm <em className="italic">tương tự</em>
              </h2>
            </div>
            <Link to="/san-pham" className="link-editorial self-start md:self-end">
              Xem Tất Cả
              <ArrowRight className="w-3 h-3" strokeWidth={2} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {relatedProducts.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProductDetailPage