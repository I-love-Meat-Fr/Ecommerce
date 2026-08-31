import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Star } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import SafeImage from './SafeImage'
import {
  skuDetailPath,
  discountPercent,
  formatVnd,
} from '../services/skuHelpers'

// One card per SKU. Inactive variants are still shown (per spec) but cannot
// be clicked, added to cart, or navigated to — they're visually muted.
//
// Anatomy (top → bottom):
//   1. Image (3:4) with optional discount badge + wishlist button.
//   2. Name + color (single line, line-clamp-1).
//   3. Meta row: star + rating.count  ·  Đã bán N.
//   4. Price row: current price (optional compare-at strikethrough).
function SkuCard({ sku }) {
  const addItem = useCartStore((state) => state.addItem)
  const isActive = sku.isActive !== false
  const displayName = sku.name || sku.productName
  const variantLabel = sku.color ? ` · ${sku.color}` : ''
  const imageUrl = sku.imageUrl || sku.productImage
  const detailPath = skuDetailPath(sku)
  const discount = discountPercent(sku)
  const currentPrice = formatVnd(sku.price) || 'Liên hệ'
  const originalPrice = sku.originalPrice ? formatVnd(sku.originalPrice) : null
  const rating = sku.rating || { avg: 0, count: 0 }
  const soldCount = Number(sku.soldCount) || 0

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isActive) return
    addItem(
      {
        id: sku.productId,
        name: sku.productName,
        category: sku.productCategory,
        imageUrl: sku.productImage,
      },
      {
        sku: sku.sku,
        name: sku.name,
        color: sku.color,
        price: sku.price,
        imageUrl: sku.imageUrl,
      },
      1,
    )
  }

  const handleCardClick = (e) => {
    if (!isActive) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  return (
    <div className={`group block ${!isActive ? 'opacity-60' : ''}`}>
      <Link
        to={isActive ? detailPath : '#'}
        onClick={handleCardClick}
        className={!isActive ? 'cursor-not-allowed pointer-events-none' : ''}
        aria-disabled={!isActive}
      >
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-ivory-100 mb-3">
          <div className="hover-zoom w-full h-full">
            <SafeImage
              src={imageUrl}
              alt={displayName}
              fallbackSeed={sku.sku || displayName}
              imgClassName="w-full h-full object-cover"
            />
          </div>

          {/* Top-left badge: discount wins over category when present */}
          {!isActive ? (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-ink-900/90 text-ivory-50 text-[10px] tracking-widest uppercase font-medium">
              Ngừng bán
            </span>
          ) : discount > 0 ? (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-[10px] tracking-widest uppercase font-semibold">
              -{discount}%
            </span>
          ) : sku.productCategory ? (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-ivory-50/95 backdrop-blur-sm text-ink-900 text-[10px] tracking-widest uppercase font-medium">
              {sku.productCategory}
            </span>
          ) : null}

          {/* Wishlist */}
          {isActive && (
            <button
              className="absolute top-3 right-3 w-8 h-8 bg-ivory-50/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-ink-900 hover:text-ivory-50"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              aria-label="Yêu thích"
            >
              <Heart className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          )}

          {/* Quick shop overlay */}
          {isActive && (
            <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out-expo">
              <button
                onClick={handleAddToCart}
                className="w-full py-2.5 bg-ink-900 text-ivory-50 text-[10px] tracking-editorial uppercase font-medium hover:bg-sage-500 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                Thêm vào giỏ
                <ArrowRight className="w-3 h-3" strokeWidth={2} />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-0.5">
          {/* Name + color */}
          <h3
            className={`font-display text-sm md:text-[15px] leading-snug mb-1.5 line-clamp-1 transition-colors duration-500 ${
              isActive
                ? 'text-ink-900 group-hover:text-sage-500'
                : 'text-ink-400 line-through'
            }`}
            title={displayName + variantLabel}
          >
            {displayName}
            {variantLabel}
          </h3>

          {/* Meta row: rating · sold count */}
          <div className="flex items-center gap-3 text-[11px] text-ink-500 mb-2 font-light">
            {rating.count > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Star
                  className="w-3 h-3 text-amber-500"
                  strokeWidth={0}
                  fill="currentColor"
                />
                <span className="text-ink-700 font-medium">
                  {Number(rating.avg).toFixed(1)}
                </span>
                <span>({rating.count})</span>
              </span>
            ) : (
              <span className="text-ink-400">Chưa có đánh giá</span>
            )}

            {soldCount > 0 ? (
              <span className="inline-flex items-center gap-1">
                <span className="text-ink-300">·</span>
                <span>Đã bán {formatSold(soldCount)}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <span className="text-ink-300">·</span>
                <span className="text-sage-600 font-medium">Mới</span>
              </span>
            )}
          </div>

          {/* Price row */}
          <div className="flex items-baseline gap-2">
            <span
              className={`font-display text-[15px] md:text-base ${
                isActive ? 'text-ink-900' : 'text-ink-400'
              }`}
            >
              {currentPrice}
            </span>
            {originalPrice && discount > 0 && (
              <span className="text-[11px] text-ink-400 line-through font-light">
                {originalPrice}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

// Compact sold-count formatter: 1.2K for 1200, 3.4K for 3400, etc.
function formatSold(n) {
  if (n < 1000) return String(n)
  if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  if (n < 1000000) return Math.round(n / 1000) + 'K'
  return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
}

export default SkuCard
