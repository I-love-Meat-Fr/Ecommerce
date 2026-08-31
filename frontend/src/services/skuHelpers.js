// Helpers for treating each product variant (SKU) as a first-class card in
// the storefront. The backend still groups variants under a Product document,
// so the FE flattens the response into a SKU array before rendering.

export function flattenSkus(products) {
  const skus = []
  for (const product of products) {
    const variants = Array.isArray(product?.variants) ? product.variants : []
    if (variants.length === 0) continue

    // The API service attaches the aggregated stats as sibling properties
    // (_soldCounts, _rating) on the unwrapped product. Tolerate either the
    // new shape or the bare shape so helpers stay unit-testable.
    const soldCounts = product?._soldCounts || {}
    const rating = product?._rating || { avg: 0, count: 0 }

    for (const variant of variants) {
      skus.push({
        // Variant fields
        sku: variant.sku,
        name: variant.name,
        color: variant.color || '',
        storage: variant.storage || '',
        price: variant.price || 0,
        originalPrice: variant.originalPrice ?? null,
        imageUrl: variant.imageUrl || '',
        isActive: variant.isActive !== false,
        // Per-SKU stats (from the embedded product stats envelope).
        soldCount: soldCounts[variant.sku] ?? 0,
        // Per-card rating — product-level (cheap; the SKU-specific rating
        // would require another roundtrip; revisit if it matters).
        rating,
        // Product context for display + sorting
        productId: product.id,
        productName: product.name || '',
        productCategory: product.category || '',
        productImage: product.imageUrl || '',
        productDescription: product.description || '',
        productCreatedAt: product.createdAt || null,
        productUpdatedAt: product.updatedAt || null,
      })
    }
  }
  return skus
}

export function sortSkus(skus, sortBy) {
  const sorted = [...skus]
  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
    case 'price-desc':
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
    case 'name-asc':
      return sorted.sort((a, b) => {
        const aKey = `${a.productName} ${a.name}`.toLowerCase()
        const bKey = `${b.productName} ${b.name}`.toLowerCase()
        return aKey.localeCompare(bKey)
      })
    case 'newest':
    default:
      return sorted.sort((a, b) => {
        const aTime = new Date(a.productUpdatedAt || a.productCreatedAt || 0).getTime()
        const bTime = new Date(b.productUpdatedAt || b.productCreatedAt || 0).getTime()
        return bTime - aTime
      })
  }
}

// Build the canonical detail-page URL for a SKU.
// Format: /san-pham/{productId}-{encodedVariantSku}
export function skuDetailPath(sku) {
  if (!sku?.productId || !sku?.sku) return '/san-pham'
  return `/san-pham/${sku.productId}-${encodeURIComponent(sku.sku)}`
}

// Parse a :handle URL param back into { productId, variantSku }.
// MongoDB ObjectIds stringify to exactly 24 hex chars, so we split at that
// boundary regardless of dashes inside the SKU itself.
export function parseSkuHandle(handle) {
  if (!handle) return { productId: '', variantSku: '' }
  const match = handle.match(/^([0-9a-f]{24})-(.+)$/i)
  if (match) {
    try {
      return { productId: match[1], variantSku: decodeURIComponent(match[2]) }
    } catch {
      return { productId: match[1], variantSku: match[2] }
    }
  }
  return { productId: handle, variantSku: '' }
}

// Return the integer discount percentage (0..100). 0 when no compare-at
// price or when it isn't strictly greater than the current price.
export function discountPercent(sku) {
  const orig = Number(sku?.originalPrice)
  const price = Number(sku?.price)
  if (!Number.isFinite(orig) || !Number.isFinite(price) || orig <= price) return 0
  return Math.round(((orig - price) / orig) * 100)
}

// Format a VND price the same way every storefront component does so the
// card and the detail page stay in sync.
export function formatVnd(value) {
  if (value == null || Number.isNaN(Number(value))) return ''
  return new Intl.NumberFormat('vi-VN').format(Number(value)) + ' ₫'
}
