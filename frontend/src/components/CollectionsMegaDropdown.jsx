import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import SafeImage from './SafeImage'
import { productApi } from '../services/api'
import { formatVnd } from '../services/skuHelpers'
import { ChevronRight } from 'lucide-react'

/**
 * Mega dropdown for the "Bộ Sưu Tập" navbar link.
 *
 * Layout (3 columns on lg+):
 *   1. Sản phẩm — top 5 popular products (compact list, hover to preview)
 *   2. Phiên bản — top 5 active SKUs/variants of the hovered product
 *   3. Nổi bật — top 3 newest products (visual cards)
 *
 * Interaction: hover a product in column 1 → column 2 swaps its SKUs.
 * Falls back to the first product on open.
 *
 * Props:
 *   onMouseEnter: forwarded hover signal to keep panel open
 *   onMouseLeave: same in reverse
 */
function CollectionsMegaDropdown({ onMouseEnter, onMouseLeave }) {
  const [products, setProducts] = useState([])
  const [featured, setFeatured] = useState([])
  const [hoveredProductId, setHoveredProductId] = useState(null)
  const [productsLoading, setProductsLoading] = useState(false)
  const [featuredLoading, setFeaturedLoading] = useState(false)
  const abortRef = useRef(null)

  // Fetch top 5 popular products (column 1).
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setProductsLoading(true)
    productApi
      .getList({ sortBy: 'popular', pageSize: 5, page: 1 })
      .then((data) => {
        if (!controller.signal.aborted) setProducts(data.items || [])
      })
      .catch((err) => {
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') return
        setProducts([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setProductsLoading(false)
      })
    return () => controller.abort()
  }, [])

  // Fetch top 3 newest products (column 3 — "Mới về").
  useEffect(() => {
    const controller = new AbortController()
    setFeaturedLoading(true)
    productApi
      .getList({ sortBy: 'newest', pageSize: 3, page: 1 })
      .then((data) => {
        if (!controller.signal.aborted) setFeatured(data.items || [])
      })
      .catch((err) => {
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') return
        setFeatured([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setFeaturedLoading(false)
      })
    return () => controller.abort()
  }, [])

  // Default to first product when the list loads after first paint.
  useEffect(() => {
    if (!hoveredProductId && products.length) setHoveredProductId(products[0].id)
  }, [products, hoveredProductId])

  // Resolve the hovered product + its top 5 active variants (column 2).
  const hoveredProduct = products.find((p) => p.id === hoveredProductId) || null
  const variants = (hoveredProduct?.variants || [])
    .filter((v) => v.isActive !== false)
    .slice(0, 5)

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="bg-ivory-50 border border-ivory-300 shadow-elevated w-[960px] max-w-[92vw] p-8 grid grid-cols-3 gap-6 animate-fade-in"
        role="menu"
        aria-label="Bộ sưu tập"
      >
        {/* ─── Column 1: top 5 products ─── */}
        <div>
          <ColumnHeader icon="01" title="Sản phẩm" subtitle="Phổ biến nhất" />
          <ul className="mt-4 space-y-0.5">
            {productsLoading && products.length === 0 ? (
              [...Array(5)].map((_, i) => (
                <li key={i} className="flex items-center gap-3 px-3 py-2">
                  <div className="w-10 h-10 shimmer flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 shimmer w-3/4" />
                    <div className="h-2.5 shimmer w-1/3" />
                  </div>
                </li>
              ))
            ) : products.length === 0 ? (
              <li className="text-xs text-ink-400 font-light px-3 py-2">
                Chưa có sản phẩm nào.
              </li>
            ) : (
              products.map((p) => {
                const active = hoveredProductId === p.id
                const firstActive =
                  (p.variants || []).find((v) => v.isActive !== false) ||
                  (p.variants || [])[0]
                const price = firstActive?.price
                const imageUrl = firstActive?.imageUrl || p.imageUrl
                const name = p.name || '—'
                // Clicking a product opens the listing page filtered by that
                // product's category. Falls back to the bare listing when the
                // product has no category assigned (defensive — categories are
                // required by the seeders but new entries may not be).
                const filterHref = p.category
                  ? `/san-pham?category=${encodeURIComponent(p.category)}`
                  : '/san-pham'
                return (
                  <li key={p.id}>
                    <Link
                      to={filterHref}
                      onMouseEnter={() => setHoveredProductId(p.id)}
                      onFocus={() => setHoveredProductId(p.id)}
                      className={`group w-full text-left px-3 py-2 flex items-center gap-3 transition-colors ${
                        active
                          ? 'bg-sage-50 text-ink-900'
                          : 'text-ink-600 hover:bg-ivory-100 hover:text-ink-900'
                      }`}
                    >
                      <div className="w-10 h-10 bg-ivory-100 overflow-hidden flex-shrink-0">
                        <SafeImage
                          src={imageUrl}
                          alt={name}
                          fallbackSeed={p.slug || name}
                          imgClassName="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-sm font-medium tracking-wide line-clamp-1"
                          title={name}
                        >
                          {name}
                        </p>
                        <p className="text-[11px] text-ink-500 mt-0.5 font-light">
                          {price != null ? formatVnd(price) : 'Liên hệ'}
                        </p>
                      </div>
                      <ChevronRight
                        className={`w-3 h-3 transition-transform ${
                          active ? 'text-sage-600 translate-x-0.5' : 'text-ink-300'
                        }`}
                        strokeWidth={1.5}
                      />
                    </Link>
                  </li>
                )
              })
            )}
          </ul>
          <Link
            to="/san-pham"
            className="mt-4 inline-flex items-center gap-1 text-[10px] tracking-widest uppercase text-ink-500 hover:text-ink-900 transition-colors"
          >
            Xem tất cả
            <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
          </Link>
        </div>

        {/* ─── Column 2: top 5 SKUs of the hovered product ─── */}
        <div>
          <ColumnHeader
            icon="02"
            title="Phiên bản"
            subtitle={hoveredProduct?.name || '—'}
          />
          <div className="mt-4 space-y-1">
            {!hoveredProduct ? (
              <p className="text-xs text-ink-400 font-light leading-relaxed">
                Di chuột qua một sản phẩm để xem các phiên bản.
              </p>
            ) : variants.length === 0 ? (
              <p className="text-xs text-ink-400 font-light leading-relaxed">
                Sản phẩm này chưa có phiên bản nào.
              </p>
            ) : (
              variants.map((variant) => {
                const variantLabel = variant.name || variant.sku || '—'
                const variantMeta = [variant.color, variant.storage]
                  .filter(Boolean)
                  .join(' · ')
                const skuHandle = `${hoveredProduct.id}-${encodeURIComponent(
                  variant.sku || ''
                )}`
                return (
                  <Link
                    key={variant.sku || variant.name}
                    to={`/san-pham/${skuHandle}`}
                    className="flex items-center gap-3 px-2 py-1.5 hover:bg-ivory-100 transition-colors"
                  >
                    <div className="w-9 h-9 bg-ivory-100 overflow-hidden flex-shrink-0">
                      <SafeImage
                        src={variant.imageUrl || hoveredProduct.imageUrl}
                        alt={variantLabel}
                        fallbackSeed={variant.sku || variantLabel}
                        imgClassName="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-xs text-ink-900 line-clamp-1 font-medium"
                        title={variantLabel}
                      >
                        {variantLabel}
                      </p>
                      {variantMeta && (
                        <p className="text-[10px] text-ink-500 mt-0.5 font-light line-clamp-1">
                          {variantMeta}
                        </p>
                      )}
                      <p className="text-[11px] text-sage-600 mt-0.5 font-semibold">
                        {variant.price != null ? formatVnd(variant.price) : 'Liên hệ'}
                      </p>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
          {hoveredProduct && (
            <Link
              to={`/san-pham/${encodeURIComponent(
                hoveredProduct.slug || hoveredProduct.id
              )}`}
              className="mt-4 inline-flex items-center gap-1 text-[10px] tracking-widest uppercase text-sage-600 hover:text-sage-700 transition-colors"
            >
              Xem chi tiết {hoveredProduct.name}
              <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
            </Link>
          )}
        </div>

        {/* ─── Column 3: top 3 featured (newest) ─── */}
        <div>
          <ColumnHeader icon="03" title="Nổi bật" subtitle="Mới về" />
          <div className="mt-4 space-y-3">
            {featuredLoading && featured.length === 0 ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-14 h-14 shimmer flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 shimmer w-3/4" />
                    <div className="h-2.5 shimmer w-1/3" />
                  </div>
                </div>
              ))
            ) : featured.length === 0 ? (
              <p className="text-xs text-ink-400 font-light leading-relaxed">
                Chưa có sản phẩm nổi bật.
              </p>
            ) : (
              featured.map((p) => <FeaturedProductCard key={p.id} product={p} />)
            )}
          </div>
          <Link
            to="/san-pham?sortBy=newest"
            className="mt-4 inline-flex items-center gap-1 text-[10px] tracking-widest uppercase text-ink-500 hover:text-ink-900 transition-colors"
          >
            Xem tất cả
            <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </div>
  )
}

// Small editorial header for each dropdown column.
function ColumnHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-baseline gap-2 pb-2 border-b border-ivory-200">
      <span className="text-[10px] font-mono tracking-widest text-sage-600 font-semibold">
        — {icon}
      </span>
      <div className="flex-1">
        <p className="text-[10px] tracking-widest uppercase text-ink-500 font-semibold">
          {title}
        </p>
        <p className="font-display text-sm text-ink-900 leading-tight mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>
  )
}

// Visual card for the "Nổi bật" column — image-forward layout, distinct from
// the compact rows used in column 1 so the two read as different surfaces.
function FeaturedProductCard({ product }) {
  const variants = product.variants || []
  const firstActive =
    variants.find((v) => v.isActive !== false) || variants[0]
  const price = firstActive?.price
  const originalPrice = firstActive?.originalPrice
  const imageUrl = firstActive?.imageUrl || product.imageUrl
  const name = product.name || '—'
  const detailPath = `/san-pham/${encodeURIComponent(
    product.slug || product.id
  )}`
  const onSale =
    Number.isFinite(Number(originalPrice)) &&
    Number(originalPrice) > Number(price)
  return (
    <Link to={detailPath} className="block group">
      <div className="aspect-[4/3] bg-ivory-100 overflow-hidden mb-2">
        <SafeImage
          src={imageUrl}
          alt={name}
          fallbackSeed={product.slug || name}
          imgClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <p
        className="text-xs text-ink-900 line-clamp-1 font-medium"
        title={name}
      >
        {name}
      </p>
      <p className="text-[11px] text-sage-600 mt-0.5 font-semibold">
        {price != null ? formatVnd(price) : 'Liên hệ'}
        {onSale && (
          <span className="ml-1 text-ink-400 font-light line-through">
            {formatVnd(originalPrice)}
          </span>
        )}
      </p>
    </Link>
  )
}

export default CollectionsMegaDropdown
