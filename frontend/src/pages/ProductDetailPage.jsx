import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productApi } from '../services/api'
import { useCartStore } from '../store/cartStore'
import ProductCard from '../components/ProductCard'
import SafeImage from '../components/SafeImage'
import {
  Minus, Plus, Heart, Share2, Check, Truck, ShieldCheck, Leaf, ArrowRight,
} from 'lucide-react'

function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addedToCart, setAddedToCart] = useState(false)
  const addItem = useCartStore(state => state.addItem)

  // Load product and auto-select first variant.
  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setProduct(null)
    setSelectedVariant(null)

    productApi.getById(id)
      .then(data => {
        if (cancelled) return
        setProduct(data)
        if (data.variants?.length) {
          setSelectedVariant(data.variants.find(v => v.isActive) ?? data.variants[0])
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id])

  // Fetch related products from the same category (excluding the current product).
  useEffect(() => {
    if (!product?.category) return
    let cancelled = false
    productApi.getByCategory(product.category)
      .then(list => {
        if (cancelled) return
        setRelated(list.filter(p => p.id !== id).slice(0, 4))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [product?.category, id])

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock === 0) return
    addItem(product, selectedVariant, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2500)
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: product.description, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
      }
    } catch {}
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN').format(price) + ' ₫'

  // Collect all image sources: main image first, then variant images that differ.
  const allImages = useMemo(() => {
    if (!product) return []
    const seen = new Set()
    const images = []
    if (product.imageUrl) {
      seen.add(product.imageUrl)
      images.push({ key: 'main', src: product.imageUrl, label: 'Ảnh chính' })
    }
    for (const v of product.variants || []) {
      if (v.imageUrl && !seen.has(v.imageUrl)) {
        seen.add(v.imageUrl)
        images.push({ key: v.sku || v.name, src: v.imageUrl, label: v.name })
      }
    }
    return images
  }, [product])

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

  if (!product) {
    return (
      <div className="bg-ivory-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-2xl text-ink-900 mb-4">Sản phẩm không tồn tại</p>
          <Link to="/products" className="link-editorial">
            ← Quay lại Bộ Sưu Tập
          </Link>
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
            <Link to="/products" className="text-ink-500 hover:text-ink-900 transition-colors">Bộ Sưu Tập</Link>
            {product.category && (
              <>
                <span className="text-ink-300">/</span>
                <Link
                  to={`/products?category=${encodeURIComponent(product.category)}`}
                  className="text-ink-500 hover:text-ink-900 transition-colors"
                >
                  {product.category}
                </Link>
              </>
            )}
            <span className="text-ink-300">/</span>
            <span className="text-ink-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </section>

      {/* Product Detail */}
      <section className="pb-20 md:pb-28">
        <div className="container-custom">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">

            {/* Image column — main + variant thumbnails */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-12 gap-3 md:gap-4">
                {allImages.length > 0 ? (
                  <>
                    <div className="col-span-12 aspect-[4/5] overflow-hidden bg-ivory-200 hover-zoom">
                      <SafeImage
                        src={allImages[0].src}
                        alt={product.name}
                        fallbackSeed={product.id || product.name}
                        imgClassName="w-full h-full object-cover"
                      />
                    </div>
                    {allImages.slice(1).map((img) => (
                      <div key={img.key} className="col-span-4 aspect-square overflow-hidden bg-ivory-200 hover-zoom">
                        <SafeImage
                          src={img.src}
                          alt={img.label}
                          fallbackSeed={img.key}
                          imgClassName="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="col-span-12 aspect-[4/5] bg-ivory-200">
                    <SafeImage
                      src=""
                      alt={product.name}
                      fallbackSeed={product.id || product.name}
                      imgClassName="w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Info column */}
            <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
              <div className="space-y-8">
                <div>
                  <p className="section-number mb-4">
                    — Mã: {selectedVariant?.sku || '—'}
                  </p>
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
                {product.description && (
                  <p className="text-ink-600 leading-relaxed font-light">
                    {product.description}
                  </p>
                )}

                {/* Variants */}
                {product.variants?.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-[10px] tracking-widest uppercase text-ink-900 font-semibold">
                        Phân loại
                      </h3>
                      {selectedVariant && (
                        <span className="text-xs text-ink-500 font-light">
                          {selectedVariant.stock > 0
                            ? `Còn ${selectedVariant.stock} sản phẩm`
                            : 'Hết hàng'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.sku || variant.name}
                          onClick={() => variant.isActive && setSelectedVariant(variant)}
                          disabled={!variant.isActive || variant.stock === 0}
                          className={`
                            flex justify-between items-center p-4 border transition-all duration-300
                            ${selectedVariant?.sku === variant.sku
                              ? 'border-ink-900 bg-ink-900 text-ivory-50'
                              : variant.isActive && variant.stock > 0
                                ? 'border-ivory-300 hover:border-ink-900 text-ink-900'
                                : 'border-ivory-200 text-ink-300 cursor-not-allowed line-through'}
                          `}
                        >
                          <span className="text-sm font-medium">
                            {variant.name}
                            {variant.color && ` · ${variant.color}`}
                          </span>
                          <span className={`font-display text-base ${
                            selectedVariant?.sku === variant.sku ? 'text-champagne-300' : 'text-ink-900'
                          }`}>
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
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={!selectedVariant || selectedVariant.stock === 0}
                      className="w-12 h-12 flex items-center justify-center hover:bg-ivory-100 transition-colors disabled:opacity-30"
                    >
                      <Minus className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center bg-transparent focus:outline-none font-display text-lg"
                      min="1"
                      max={selectedVariant?.stock || 999}
                      disabled={!selectedVariant || selectedVariant.stock === 0}
                    />
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      disabled={!selectedVariant || selectedVariant.stock === 0 || quantity >= (selectedVariant?.stock || 999)}
                      className="w-12 h-12 flex items-center justify-center hover:bg-ivory-100 transition-colors disabled:opacity-30"
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
                    className={`w-full btn-luxury disabled:cursor-not-allowed disabled:opacity-40 ${
                      addedToCart ? 'bg-champagne-500 border-champagne-500' : ''
                    }`}
                  >
                    {addedToCart ? (
                      <>
                        <Check className="w-4 h-4" strokeWidth={1.5} />
                        Đã Thêm Vào Giỏ
                      </>
                    ) : !selectedVariant ? (
                      'Chọn phân loại'
                    ) : selectedVariant.stock === 0 ? (
                      'Hết Hàng'
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

      {/* Related products */}
      {related.length > 0 && (
        <section className="py-16 md:py-20 bg-ivory-100">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <p className="section-number mb-3">— Cùng Danh Mục</p>
                <h2 className="font-display text-display-lg text-ink-900">
                  Sản phẩm <em className="italic">tương tự</em>
                </h2>
              </div>
              <Link
                to={`/products?category=${encodeURIComponent(product.category)}`}
                className="link-editorial self-start md:self-end"
              >
                Xem Tất Cả
                <ArrowRight className="w-3 h-3" strokeWidth={2} />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductDetailPage
