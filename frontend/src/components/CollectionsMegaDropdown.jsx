import { useEffect, useState, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import SafeImage from './SafeImage'
import { productApi } from '../services/api'
import { formatVnd } from '../services/skuHelpers'
import { ChevronRight, Sparkles } from 'lucide-react'

/**
 * Mega dropdown for the "Bộ Sưu Tập" navbar link.
 *
 * Layout (4 columns on lg+):
 *   1. Danh mục cây (root categories only — level 1)
 *   2. Danh mục cấp 2 của cate đang chọn (children of hovered root)
 *   3. Sản phẩm nổi bật theo danh mục đang chọn (top 3 popular SKUs)
 *   4. Reserved for future content (placeholder)
 *
 * Interaction: hover a root in column 1 → column 2 swaps to its children
 * and column 3 fetches the most popular products under that root.
 *
 * Props:
 *   tree             : full category tree from `categoryApi.getTree()`
 *   onMouseEnter     : forwarded hover signal to the trigger (keeps the panel
 *                      open while moving from trigger → panel)
 *   onMouseLeave     : same in reverse
 *   onClose          : called when user explicitly clicks a nav link inside
 */
function CollectionsMegaDropdown({ tree, onMouseEnter, onMouseLeave }) {
  // First root = default selection so columns 2 & 3 aren't empty on open.
  const firstRoot = tree[0]
  const [hoveredSlug, setHoveredSlug] = useState(firstRoot?.slug || null)
  const [featured, setFeatured] = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(false)
  const abortRef = useRef(null)

  // Root list (level 1) — top-level entries from the tree.
  const rootCategories = useMemo(() => Array.isArray(tree) ? tree : [], [tree])

  // Children of the currently hovered root (level 2). Falls back to empty
  // array when nothing is hovered or the root has no children.
  const hoveredRoot = useMemo(
    () => rootCategories.find((r) => r.slug === hoveredSlug) || null,
    [rootCategories, hoveredSlug],
  )
  const subCategories = hoveredRoot?.children || []

  // Fetch featured products under the hovered root. Re-runs when the user
  // moves the mouse to a different root. Includes descendants of children
  // so e.g. "Cây Cảnh" surfaces Monstera, Lan Ý, Sen Đá products.
  useEffect(() => {
    if (!hoveredRoot) {
      setFeatured([])
      return
    }
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setFeaturedLoading(true)
    productApi
      .getList({
        category: hoveredRoot.slug,
        sortBy: 'popular',
        pageSize: 3,
        page: 1,
      })
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
  }, [hoveredRoot])

  // Keep a sensible default when the tree finishes loading after first paint.
  useEffect(() => {
    if (!hoveredSlug && firstRoot) setHoveredSlug(firstRoot.slug)
  }, [firstRoot, hoveredSlug])

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="bg-ivory-50 border border-ivory-300 shadow-elevated w-[1100px] max-w-[92vw] p-8 grid grid-cols-4 gap-6 animate-fade-in"
        role="menu"
        aria-label="Bộ sưu tập"
      >
        {/* ─── Column 1: level-1 (root) categories ─── */}
        <div>
          <ColumnHeader icon="01" title="Danh mục" subtitle="Cây & hoa" />
          <ul className="mt-4 space-y-0.5">
            {rootCategories.map((root) => {
              const active = hoveredSlug === root.slug
              return (
                <li key={root.id || root.slug}>
                  <button
                    type="button"
                    onMouseEnter={() => setHoveredSlug(root.slug)}
                    onFocus={() => setHoveredSlug(root.slug)}
                    className={`group w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                      active
                        ? 'bg-sage-50 text-ink-900'
                        : 'text-ink-600 hover:bg-ivory-100 hover:text-ink-900'
                    }`}
                  >
                    <span className="text-sm font-medium tracking-wide">
                      {root.name}
                    </span>
                    <ChevronRight
                      className={`w-3 h-3 transition-transform ${
                        active
                          ? 'text-sage-600 translate-x-0.5'
                          : 'text-ink-300'
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>
                </li>
              )
            })}
          </ul>
          <Link
            to="/san-pham"
            className="mt-4 inline-flex items-center gap-1 text-[10px] tracking-widest uppercase text-ink-500 hover:text-ink-900 transition-colors"
          >
            Xem tất cả
            <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
          </Link>
        </div>

        {/* ─── Column 2: level-2 children of the hovered root ─── */}
        <div>
          <ColumnHeader
            icon="02"
            title="Danh mục cấp 2"
            subtitle={hoveredRoot?.name || '—'}
          />
          <div className="mt-4">
            {subCategories.length === 0 ? (
              <p className="text-xs text-ink-400 font-light leading-relaxed">
                {hoveredRoot
                  ? 'Danh mục này chưa có phân loại cấp 2.'
                  : 'Chọn một danh mục ở cột 1 để xem cấp 2.'}
              </p>
            ) : (
              <ul className="space-y-0.5">
                {subCategories.map((sub) => (
                  <li key={sub.id || sub.slug}>
                    <Link
                      to={`/san-pham?category=${encodeURIComponent(sub.slug)}`}
                      className="block px-3 py-2 text-sm text-ink-700 hover:bg-ivory-100 hover:text-ink-900 transition-colors"
                    >
                      {sub.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ─── Column 3: featured products under the hovered root ─── */}
        <div className="col-span-1">
          <ColumnHeader
            icon="03"
            title="Nổi bật"
            subtitle={hoveredRoot ? `Top ${hoveredRoot.name}` : '—'}
          />
          <div className="mt-4 space-y-3">
            {featuredLoading && featured.length === 0 ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 shimmer flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 shimmer w-3/4" />
                    <div className="h-2.5 shimmer w-1/3" />
                  </div>
                </div>
              ))
            ) : featured.length === 0 ? (
              <p className="text-xs text-ink-400 font-light leading-relaxed">
                Chưa có sản phẩm nổi bật cho danh mục này.
              </p>
            ) : (
              featured.map((p) => (
                <FeaturedProductRow key={p.id} product={p} />
              ))
            )}
          </div>
          {hoveredRoot && (
            <Link
              to={`/san-pham?category=${encodeURIComponent(hoveredRoot.slug)}`}
              className="mt-4 inline-flex items-center gap-1 text-[10px] tracking-widest uppercase text-ink-500 hover:text-ink-900 transition-colors"
            >
              Xem tất cả
              <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
            </Link>
          )}
        </div>

        {/* ─── Column 4: reserved (placeholder) ─── */}
        <div>
          <ColumnHeader
            icon="04"
            title="Khám phá"
            subtitle="Sắp ra mắt"
          />
          <div className="mt-4 aspect-[4/3] bg-ivory-100 flex flex-col items-center justify-center text-center px-4 border border-dashed border-ivory-300">
            <Sparkles
              className="w-5 h-5 text-sage-500 mb-2"
              strokeWidth={1.5}
            />
            <p className="text-[11px] tracking-widest uppercase text-ink-500 font-medium">
              Sắp Ra Mắt
            </p>
            <p className="text-[10px] text-ink-400 mt-1 font-light leading-relaxed">
              Phần này sẽ được bổ sung trong thời gian tới.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Small editorial header for each dropdown column. The "01"–"04" badge
// keeps the four columns visually anchored to the same rhythm.
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

/**
 * FeaturedProductRow — compact "list row" preview: small image on the left,
 * name + price stacked on the right. Clicking navigates to the detail page.
 */
function FeaturedProductRow({ product }) {
  const variants = product.variants || []
  // Pick the first active variant for the price + image.
  const firstActive = variants.find((v) => v.isActive !== false) || variants[0]
  const price = firstActive?.price
  const imageUrl = firstActive?.imageUrl || product.imageUrl
  const name = product.name || '—'
  const detailPath = `/san-pham/${encodeURIComponent(product.slug || product.id)}`
  return (
    <Link
      to={detailPath}
      className="flex items-center gap-3 px-2 py-1.5 hover:bg-ivory-100 transition-colors"
    >
      <div className="w-12 h-12 bg-ivory-100 overflow-hidden flex-shrink-0">
        <SafeImage
          src={imageUrl}
          alt={name}
          fallbackSeed={product.slug || name}
          imgClassName="w-full h-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-ink-900 line-clamp-1 font-medium" title={name}>
          {name}
        </p>
        <p className="text-[11px] text-ink-500 mt-0.5 font-light">
          {price != null ? formatVnd(price) : 'Liên hệ'}
        </p>
      </div>
    </Link>
  )
}

export default CollectionsMegaDropdown