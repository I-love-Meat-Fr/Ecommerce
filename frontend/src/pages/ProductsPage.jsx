import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import SkuCard from '../components/SkuCard'
import { productApi, categoryApi, PRODUCT_SORT_OPTIONS } from '../services/api'
import { flattenSkus } from '../services/skuHelpers'
import {
  Filter, ChevronDown, ArrowUpDown, X,
} from 'lucide-react'

// Stable shape used in the URL → state bridge. The "all" sentinel marks
// the unset category filter so the URL stays clean (?category=…) but we
// can still tell "explicitly unfiltered" from "missing param".
const ALL = 'all'
const DEFAULT_PAGE_SIZE = 12

// Translate the in-memory sort key into a human label. Falls back to the
// canonical list in api.js so the dropdown and the URL stay in sync.
const SORT_LABEL = Object.fromEntries(
  PRODUCT_SORT_OPTIONS.map((o) => [o.value, o.label])
)

// Walk the category tree to find which root contains the given slug. Used
// to drive the level-2 sub-bar — when the user is on a child slug we still
// want to highlight the root above it. Returns null when no category is
// selected or the slug is not found anywhere in the tree.
function findRootOfSlug(tree, slug) {
  if (!Array.isArray(tree) || !slug || slug === ALL) return null
  for (const root of tree) {
    if (root.slug === slug) return root
    if (containsSlug(root.children, slug)) return root
  }
  return null
}

function containsSlug(children, slug) {
  if (!Array.isArray(children)) return false
  for (const c of children) {
    if (c.slug === slug) return true
    if (containsSlug(c.children, slug)) return true
  }
  return false
}

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // ── URL-derived state ─────────────────────────────────────────────────
  const categoryParam = searchParams.get('category') || ALL
  const searchQuery = searchParams.get('search') || ''
  const pageParam = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const sizeParam = searchParams.get('size')
    ? Math.min(5, Math.max(1, parseInt(searchParams.get('size'), 10) || 0))
    : null
  const minCareParam = searchParams.get('minCare')
    ? Math.min(5, Math.max(1, parseInt(searchParams.get('minCare'), 10) || 0))
    : null
  const maxCareParam = searchParams.get('maxCare')
    ? Math.min(5, Math.max(1, parseInt(searchParams.get('maxCare'), 10) || 0))
    : null
  const minPriceParam = searchParams.get('minPrice')
    ? Number(searchParams.get('minPrice'))
    : null
  const maxPriceParam = searchParams.get('maxPrice')
    ? Number(searchParams.get('maxPrice'))
    : null
  const sortParam = searchParams.get('sort') || 'popular'

  // ── Component state ──────────────────────────────────────────────────
  const [categoryTree, setCategoryTree] = useState([])
  const [productsResponse, setProductsResponse] = useState({
    items: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0, totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // Local-only filter form state. The server-side filter is committed only
  // on "Áp dụng" so we don't fire a request request per keystroke.
  const [draftFilters, setDraftFilters] = useState({
    minPrice: minPriceParam ?? '',
    maxPrice: maxPriceParam ?? '',
    size: sizeParam ?? '',
    minCare: minCareParam ?? '',
    maxCare: maxCareParam ?? '',
  })

  // ── Loaders ──────────────────────────────────────────────────────────
  // Category tree is small + stable — fetch once, then cache.
  useEffect(() => {
    let mounted = true
    categoryApi.getTree()
      .then((tree) => { if (mounted) setCategoryTree(tree || []) })
      .catch(() => { if (mounted) setCategoryTree([]) })
    return () => { mounted = false }
  }, [])

  // Re-fetch products whenever any committed filter changes. Pagination
  // resets to 1 when the filter set changes (a new search ≠ "next page").
  const filterKey = JSON.stringify({
    category: categoryParam,
    search: searchQuery,
    size: sizeParam,
    minCare: minCareParam,
    maxCare: maxCareParam,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
    sort: sortParam,
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const filters = {
      page: pageParam,
      pageSize: DEFAULT_PAGE_SIZE,
      sortBy: sortParam,
    }
    if (categoryParam !== ALL) filters.category = categoryParam
    if (searchQuery) filters.search = searchQuery
    if (sizeParam != null) filters.size = sizeParam
    if (minCareParam != null) filters.minCareLevel = minCareParam
    if (maxCareParam != null) filters.maxCareLevel = maxCareParam
    if (minPriceParam != null) filters.minPrice = minPriceParam
    if (maxPriceParam != null) filters.maxPrice = maxPriceParam

    productApi.getList(filters)
      .then((data) => {
        if (cancelled) return
        setProductsResponse({
          items: data.items || [],
          total: data.total || 0,
          page: data.page || 1,
          pageSize: data.pageSize || DEFAULT_PAGE_SIZE,
          totalPages: data.totalPages || 0,
          hasNextPage: !!data.hasNextPage,
          hasPrevPage: !!data.hasPrevPage,
        })
      })
      .catch(() => {
        if (cancelled) return
        setProductsResponse({
          items: [], total: 0, page: 1, pageSize: DEFAULT_PAGE_SIZE,
          totalPages: 0, hasNextPage: false, hasPrevPage: false,
        })
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [filterKey, pageParam]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── URL mutators ─────────────────────────────────────────────────────
  const updateParams = useCallback((mutator) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      mutator(next)
      return next
    })
  }, [setSearchParams])

  const setCategory = (slug) => {
    updateParams((p) => {
      if (!slug || slug === ALL) p.delete('category')
      else p.set('category', slug)
      p.delete('page') // reset pagination on filter change
    })
    setShowFilters(false)
  }

  const setSearch = (q) => {
    updateParams((p) => {
      if (!q) p.delete('search')
      else p.set('search', q)
      p.delete('page')
    })
  }

  const setSort = (s) => {
    updateParams((p) => {
      if (s === 'popular') p.delete('sort')
      else p.set('sort', s)
    })
  }

  const applyDraftFilters = () => {
    updateParams((p) => {
      const setOrDelete = (key, value) => {
        if (value === '' || value == null) p.delete(key)
        else p.set(key, String(value))
      }
      setOrDelete('minPrice', draftFilters.minPrice)
      setOrDelete('maxPrice', draftFilters.maxPrice)
      setOrDelete('size', draftFilters.size)
      setOrDelete('minCare', draftFilters.minCare)
      setOrDelete('maxCare', draftFilters.maxCare)
      p.delete('page')
    })
    setShowFilters(false)
  }

  const clearAllFilters = () => {
    updateParams((p) => {
      p.delete('category')
      p.delete('minPrice')
      p.delete('maxPrice')
      p.delete('size')
      p.delete('minCare')
      p.delete('maxCare')
      p.delete('search')
      p.delete('page')
    })
    setDraftFilters({ minPrice: '', maxPrice: '', size: '', minCare: '', maxCare: '' })
    setShowFilters(false)
  }

  const goToPage = (n) => {
    updateParams((p) => {
      if (n <= 1) p.delete('page')
      else p.set('page', String(n))
    })
    // Smooth scroll to top of grid on pagination so users don't get lost.
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 240, behavior: 'smooth' })
    }
  }

  // ── Derived state ────────────────────────────────────────────────────
  const allSkus = useMemo(
    () => flattenSkus(productsResponse.items),
    [productsResponse.items]
  )

  // Build a flat list of category options for the sidebar. Roots first,
  // then their children, with their name indented to convey depth. This is
  // the "mega-menu lite" used both for browsing and for filter context.
  const flatCategoryOptions = useMemo(() => {
    const out = [{ id: ALL, slug: ALL, name: 'Tất Cả', subtitle: 'Toàn bộ', depth: 0 }]
    const visit = (node, depth) => {
      out.push({
        id: node.id, slug: node.slug, name: node.name, depth,
      })
      for (const child of node.children || []) {
        visit(child, depth + 1)
      }
    }
    for (const root of categoryTree) visit(root, 1)
    return out
  }, [categoryTree])

  // Resolve the currently-selected category (by slug) so the header card can
  // show its proper display name + subtitle.
  const currentCategory = useMemo(() => {
    if (categoryParam === ALL) {
      return { slug: ALL, name: 'Toàn Bộ', subtitle: 'Sản Phẩm' }
    }
    const found = flatCategoryOptions.find((c) => c.slug === categoryParam)
    return found || { slug: categoryParam, name: categoryParam, subtitle: '' }
  }, [categoryParam, flatCategoryOptions])

  // The root that owns the currently selected slug. Used to render the
  // level-2 sub-bar — even when the user is deep inside the tree we still
  // know which level-1 pill to keep highlighted above.
  const activeRoot = useMemo(
    () => findRootOfSlug(categoryTree, categoryParam),
    [categoryTree, categoryParam]
  )

  const hasActiveFilters =
    categoryParam !== ALL ||
    searchQuery ||
    minPriceParam != null ||
    maxPriceParam != null ||
    sizeParam != null ||
    minCareParam != null ||
    maxCareParam != null

  return (
    <div className="bg-ivory-50 min-h-screen">
      {/* ========== EDITORIAL HEADER ========== */}
      <section className="pt-12 md:pt-20 pb-12 md:pb-16">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-[11px] tracking-widest uppercase mb-10">
            <Link to="/" className="text-ink-500 hover:text-ink-900 transition-colors">Trang Chủ</Link>
            <span className="text-ink-300">/</span>
            <span className="text-ink-900 font-medium">Bộ Sưu Tập</span>
          </nav>

          <div className="grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-7">
              <p className="section-number mb-4">— Bộ Sưu Tập / {currentCategory.subtitle || currentCategory.name}</p>
              <h1 className="font-display text-display-lg text-ink-900">
                {currentCategory.name}<br/>
                <em className="italic text-champagne-500">sản phẩm</em>
              </h1>
              {searchQuery && (
                <p className="mt-4 text-sm text-ink-500 font-light">
                  Kết quả cho <span className="text-ink-900 italic font-display">"{searchQuery}"</span>
                </p>
              )}
            </div>
            <div className="md:col-span-4 md:col-start-9">
              <p className="text-ink-500 leading-relaxed font-light text-sm">
                Khám phá bộ sưu tập cây giống và cây cảnh được tuyển chọn,
                mang đến vẻ đẹp tinh tế cho không gian sống của bạn.
              </p>
              <p className="text-[10px] tracking-widest uppercase text-champagne-500 font-semibold mt-4">
                Hiển thị {allSkus.length} / {productsResponse.total} sản phẩm
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom"><div className="divider-thin" /></div>

      {/* ========== CATEGORY FILTER BAR (Level 1 + Level 2) ========== */}
      {/* Two-row pill strip: level 1 = root categories, level 2 = children of
          the active root. Mirrors the URL `category` param so picking a pill
          drives the same fetch as typing the slug directly. Hidden until
          the tree finishes loading so we don't render an empty bar. */}
      {categoryTree.length > 0 && (
        <section
          aria-label="Bộ lọc danh mục"
          className="border-b border-ivory-300 bg-ivory-50"
        >
          <div className="container-custom py-5 md:py-6 space-y-3 md:space-y-4">
            {/* Level 1 — root categories */}
            <div className="flex items-center gap-2 md:gap-3 -mx-6 px-6 md:mx-0 md:px-0 overflow-x-auto md:overflow-visible scrollbar-hide">
              <span className="hidden md:inline-block text-[10px] tracking-[0.25em] uppercase text-ink-400 font-semibold mr-1 flex-shrink-0">
                Danh Mục
              </span>
              <CategoryPill
                label="Tất Cả"
                active={categoryParam === ALL}
                onClick={() => setCategory(ALL)}
              />
              {categoryTree.map((root) => (
                <CategoryPill
                  key={root.id || root.slug}
                  label={root.name}
                  active={activeRoot?.slug === root.slug}
                  onClick={() => setCategory(root.slug)}
                />
              ))}
            </div>

            {/* Level 2 — children of the active root. Hidden when no root is
                active or when the root has no children. The "Tất cả" pill at
                the head of the row clears back to the root itself. */}
            {activeRoot?.children?.length > 0 && (
              <div className="flex items-center gap-1.5 md:gap-2 md:pl-[104px] -mx-6 px-6 md:mx-0 md:px-0 overflow-x-auto md:overflow-visible scrollbar-hide">
                <span className="hidden md:inline-block text-[10px] tracking-[0.25em] uppercase text-ink-300 font-semibold mr-1 flex-shrink-0">
                  —
                </span>
                <SubCategoryPill
                  label="Tất cả"
                  active={categoryParam === activeRoot.slug}
                  onClick={() => setCategory(activeRoot.slug)}
                />
                {activeRoot.children.map((sub) => (
                  <SubCategoryPill
                    key={sub.id || sub.slug}
                    label={sub.name}
                    active={categoryParam === sub.slug}
                    onClick={() => setCategory(sub.slug)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========== FILTERS BAR ========== */}
      <section className="sticky top-[100px] z-30 bg-ivory-50/95 backdrop-blur-md py-5 border-b border-ivory-300">
        <div className="container-custom">
          <div className="flex items-center justify-between gap-6">
            {/* Mobile filter button — desktop cats live in the mega dropdown */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 text-sm tracking-widest uppercase"
            >
              <Filter className="w-4 h-4" strokeWidth={1.5} />
              Bộ Lọc
            </button>

            {/* Desktop — small count + active category breadcrumb */}
            <div className="hidden lg:flex items-center gap-3 text-[11px] tracking-widest uppercase text-ink-500">
              <span className="font-semibold text-ink-900">
                {productsResponse.total}
              </span>
              <span>sản phẩm</span>
              {categoryParam !== ALL && (
                <>
                  <span className="text-ink-300">/</span>
                  <button
                    onClick={() => setCategory(ALL)}
                    className="text-ink-500 hover:text-ink-900 transition-colors"
                  >
                    {currentCategory.name}
                  </button>
                </>
              )}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="ml-3 text-ink-400 hover:text-ink-900 transition-colors underline-offset-4 hover:underline"
                >
                  Xóa tất cả bộ lọc
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative flex items-center gap-3 ml-auto">
              <ArrowUpDown className="w-3 h-3 text-ink-400 hidden sm:block" strokeWidth={1.5} />
              <select
                value={sortParam}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-transparent text-sm tracking-wide pr-6 cursor-pointer focus:outline-none text-ink-700"
              >
                {PRODUCT_SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-400 pointer-events-none" />
            </div>
          </div>

          {/* Mobile / drawer filters panel */}
          {showFilters && (
            <div className="lg:hidden mt-5 pt-5 border-t border-ivory-300 space-y-4">
              <FilterPanel
                draft={draftFilters}
                onChange={setDraftFilters}
                onApply={applyDraftFilters}
                onReset={() => setDraftFilters({ minPrice: '', maxPrice: '', size: '', minCare: '', maxCare: '' })}
              />
            </div>
          )}
        </div>
      </section>

      {/* ========== BODY: SIDEBAR + GRID ========== */}
      <section className="py-12 md:py-20">
        <div className="container-custom grid lg:grid-cols-12 gap-6">
          {/* Desktop filter sidebar — narrower column for compact density */}
          <aside className="hidden lg:block lg:col-span-2">
            <div className="sticky top-[160px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base text-ink-900">Bộ Lọc</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[10px] tracking-widest uppercase text-ink-500 hover:text-ink-900 transition-colors"
                  >
                    Xóa hết
                  </button>
                )}
              </div>
              <FilterPanel
                draft={draftFilters}
                onChange={setDraftFilters}
                onApply={applyDraftFilters}
                onReset={() => setDraftFilters({ minPrice: '', maxPrice: '', size: '', minCare: '', maxCare: '' })}
              />
            </div>
          </aside>

          {/* Product grid — 4 columns on xl for compact product cards */}
          <div className="lg:col-span-10">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
                {[...Array(8)].map((_, i) => (
                  <div key={i}>
                    <div className="aspect-square shimmer mb-3" />
                    <div className="h-3.5 shimmer w-2/3 mb-2" />
                    <div className="h-2.5 shimmer w-full mb-2" />
                    <div className="h-3.5 shimmer w-1/3" />
                  </div>
                ))}
              </div>
            ) : allSkus.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
                  {allSkus.map((sku, i) => (
                    <SkuCard key={`${sku.productId}-${sku.sku}`} sku={sku} index={i} />
                  ))}
                </div>

                <Pagination
                  page={pageParam}
                  totalPages={productsResponse.totalPages}
                  onChange={goToPage}
                />
              </>
            ) : (
              <div className="text-center py-20 max-w-md mx-auto">
                <X className="w-12 h-12 text-ivory-300 mx-auto mb-6" strokeWidth={1} />
                <h3 className="font-display text-2xl text-ink-900 mb-3">Không tìm thấy sản phẩm</h3>
                <p className="text-ink-500 font-light mb-8">
                  {hasActiveFilters
                    ? 'Hãy thử bỏ bớt bộ lọc hoặc tìm kiếm với từ khóa khác.'
                    : 'Bộ sưu tập đang được cập nhật.'}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {hasActiveFilters && (
                    <button onClick={clearAllFilters} className="btn-luxury-outline">
                      Bỏ Tất Cả Bộ Lọc
                    </button>
                  )}
                  <Link to="/san-pham" className="btn-luxury-outline">
                    Xem Toàn Bộ Sản Phẩm
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// Sub-components
// ───────────────────────────────────────────────────────────────────────────

/**
 * CategoryPill — primary level-1 pill. Higher visual weight (ink-900 fill)
 * to anchor the level-2 row visually below it. Whitespace-nowrap so the
 * mobile horizontal scroll works cleanly.
 */
function CategoryPill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-shrink-0 px-4 md:px-5 py-2 text-[11px] md:text-[12px] tracking-[0.15em] uppercase font-medium border transition-colors duration-300 whitespace-nowrap ${
        active
          ? 'bg-ink-900 text-ivory-50 border-ink-900'
          : 'bg-transparent text-ink-700 border-ivory-300 hover:border-ink-900 hover:text-ink-900'
      }`}
    >
      {label}
    </button>
  )
}

/**
 * SubCategoryPill — level-2 pill. Softer active state (sage-600) so it
 * reads as subordinate to whichever CategoryPill is filled above. Smaller
 * type and tighter padding to reinforce the hierarchy.
 */
function SubCategoryPill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-shrink-0 px-3 md:px-3.5 py-1.5 text-[10px] md:text-[11px] tracking-[0.12em] uppercase font-medium border transition-colors duration-300 whitespace-nowrap ${
        active
          ? 'bg-sage-600 text-ivory-50 border-sage-600'
          : 'bg-transparent text-ink-600 border-ivory-200 hover:border-sage-500 hover:text-sage-700'
      }`}
    >
      {label}
    </button>
  )
}

/**
 * FilterPanel — price range, plant size, care-level range. Compact density
 * to fit the narrower (col-span-2) sidebar. Form is local state until the
 * user clicks "Áp dụng" — this avoids a server roundtrip per keystroke.
 */
function FilterPanel({ draft, onChange, onApply, onReset }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onApply() }}
      className="space-y-4"
    >
      {/* Price */}
      <div>
        <label className="block text-[9px] tracking-widest uppercase text-ink-500 font-semibold mb-1.5">
          Khoảng Giá
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="10000"
            placeholder="Từ"
            value={draft.minPrice}
            onChange={(e) => onChange({ ...draft, minPrice: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs border border-ivory-300 rounded-xs focus:outline-none focus:border-ink-900"
          />
          <span className="text-ink-400 text-[10px]">—</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="10000"
            placeholder="Đến"
            value={draft.maxPrice}
            onChange={(e) => onChange({ ...draft, maxPrice: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs border border-ivory-300 rounded-xs focus:outline-none focus:border-ink-900"
          />
        </div>
      </div>

      {/* Size */}
      <div>
        <label className="block text-[9px] tracking-widest uppercase text-ink-500 font-semibold mb-1.5">
          Kích Thước
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => onChange({ ...draft, size: draft.size === String(n) ? '' : String(n) })}
              className={`flex-1 h-7 text-[11px] font-medium border transition-colors ${
                draft.size === String(n)
                  ? 'bg-ink-900 text-ivory-50 border-ink-900'
                  : 'border-ivory-300 text-ink-700 hover:border-ink-900'
              }`}
              title={`Size ${n}`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-ink-400 mt-1 font-light">1 = mini · 5 = lớn</p>
      </div>

      {/* Care */}
      <div>
        <label className="block text-[9px] tracking-widest uppercase text-ink-500 font-semibold mb-1.5">
          Chăm Sóc
        </label>
        <div className="flex items-center gap-1.5">
          <select
            value={draft.minCare}
            onChange={(e) => onChange({ ...draft, minCare: e.target.value })}
            className="w-full px-2 py-1.5 text-xs border border-ivory-300 rounded-xs focus:outline-none focus:border-ink-900 bg-white"
          >
            <option value="">Từ 1</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span className="text-ink-400 text-[10px]">—</span>
          <select
            value={draft.maxCare}
            onChange={(e) => onChange({ ...draft, maxCare: e.target.value })}
            className="w-full px-2 py-1.5 text-xs border border-ivory-300 rounded-xs focus:outline-none focus:border-ink-900 bg-white"
          >
            <option value="">Đến 5</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <p className="text-[10px] text-ink-400 mt-1 font-light">1 = khó · 5 = dễ</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5 pt-1">
        <button
          type="submit"
          className="w-full py-2 bg-ink-900 text-ivory-50 text-[10px] tracking-editorial uppercase font-medium hover:bg-ink-700 transition-colors"
        >
          Áp Dụng
        </button>
          <button
            type="button"
            onClick={onReset}
            className="w-full py-1.5 text-[10px] tracking-editorial uppercase font-medium text-ink-500 hover:text-ink-900 transition-colors"
          >
            Đặt Lại
          </button>
        </div>
    </form>
  )
}

/**
 * Pagination — windowed so we don't render 50 buttons for huge result sets.
 * Always shows first, last, current ±1, plus ellipses around gaps.
 */
function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null

  const range = []
  range.push(1)
  for (let i = page - 1; i <= page + 1; i++) {
    if (i > 1 && i < totalPages) range.push(i)
  }
  if (totalPages > 1) range.push(totalPages)

  // Dedupe and add ellipses for gaps of >1.
  const withEllipsis = []
  let prev = 0
  for (const n of [...new Set(range)].sort((a, b) => a - b)) {
    if (n - prev > 1 && prev > 0) withEllipsis.push('…')
    withEllipsis.push(n)
    prev = n
  }

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2 mt-14 pt-10 border-t border-ivory-300"
      aria-label="Pagination"
    >
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="px-3 h-10 text-sm border border-ivory-300 hover:border-ink-900 hover:text-ink-900 disabled:opacity-30 disabled:hover:border-ivory-300 transition-colors"
      >
        ← Trước
      </button>
      {withEllipsis.map((n, i) =>
        n === '…' ? (
          <span key={`gap-${i}`} className="px-2 text-ink-400 text-sm">…</span>
        ) : (
          <button
            key={n}
            onClick={() => onChange(n)}
            aria-current={n === page ? 'page' : undefined}
            className={`w-10 h-10 text-sm border transition-colors ${
              n === page
                ? 'bg-ink-900 text-ivory-50 border-ink-900'
                : 'border-ivory-300 text-ink-700 hover:border-ink-900 hover:text-ink-900'
            }`}
          >
            {n}
          </button>
        )
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 h-10 text-sm border border-ivory-300 hover:border-ink-900 hover:text-ink-900 disabled:opacity-30 disabled:hover:border-ivory-300 transition-colors"
      >
        Sau →
      </button>
    </nav>
  )
}

export default ProductsPage