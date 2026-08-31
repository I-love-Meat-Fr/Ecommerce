import axios from 'axios'

// Vite dev server proxies /api -> http://localhost:8080 (see vite.config.js).
// In production, point VITE_API_URL to the deployed API origin.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

const TOKEN_KEY = 'florist-auth-token'

export const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const setStoredToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore quota / private-mode errors
  }
}

// Attach the JWT to every outgoing request when present.
api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401 so a stale token never lingers in the UI.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setStoredToken(null)
      // Notify the auth store (imported lazily to avoid circular deps).
      window.dispatchEvent(new CustomEvent('florist:auth:logout'))
    }
    return Promise.reject(error)
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Server-side filter / pagination contract for `GET /api/products`.
 * Keep this in sync with `ProductQueryParams` on the backend.
 *
 * Server-side:
 *  - `category` may be a leaf OR a parent slug — the server expands parents
 *    to all leaf descendants before matching, so the storefront can offer a
 *    "Cây Cảnh" filter that includes every product under it.
 *  - `size`, `minCareLevel`, `maxCareLevel` operate on the per-SKU
 *    PlantAttributes profile (1–5 scale).
 *  - `sortBy` is one of: 'popular' (default), 'newest', 'price-asc',
 *    'price-desc', 'name-asc'.
 */
export const PRODUCT_SORT_OPTIONS = [
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá thấp đến cao' },
  { value: 'price-desc', label: 'Giá cao đến thấp' },
  { value: 'name-asc', label: 'Tên A–Z' },
]

export const productApi = {
  // ── Raw paginated list (envelope-preserving meta, bare-product items) ─
  // Returns the full `{ items, total, page, pageSize, totalPages,
  //   hasNextPage, hasPrevPage }` envelope so callers can render pagination.
  // The `items` array contains BARE product objects (with `_soldCounts` &
  // `_rating` attached as siblings) — same shape as `getAll()` returns —
  // so a `flattenSkus(items)` call works without further unwrapping.
  // Use this from the storefront listing page; for "everything" reads
  // prefer `getAll` (which just caps pageSize and flattens the result).
  getList: async (filters = {}) => {
    const params = {}
    if (filters.category) params.category = filters.category
    if (filters.search) params.search = filters.search
    if (filters.minPrice != null) params.minPrice = filters.minPrice
    if (filters.maxPrice != null) params.maxPrice = filters.maxPrice
    if (filters.size != null) params.size = filters.size
    if (filters.minCareLevel != null) params.minCareLevel = filters.minCareLevel
    if (filters.maxCareLevel != null) params.maxCareLevel = filters.maxCareLevel
    if (filters.page) params.page = filters.page
    if (filters.pageSize) params.pageSize = filters.pageSize
    if (filters.sortBy) params.sortBy = filters.sortBy
    const response = await api.get('/products', { params })
    const data = response.data || {}
    return {
      items: unwrapProductList(data),
      total: data.total ?? 0,
      page: data.page ?? 1,
      pageSize: data.pageSize ?? 0,
      totalPages: data.totalPages ?? 0,
      hasNextPage: !!data.hasNextPage,
      hasPrevPage: !!data.hasPrevPage,
    }
  },

  // ── Flat-array convenience wrappers (for Home, related products, etc.) ─
  // These cap pageSize at the server's 100-item max so they always return
  // the entire matching catalog (or as much as fits in a single response).
  getAll: async () => {
    const response = await api.get('/products', { params: { pageSize: 100 } })
    return unwrapProductList(response.data)
  },

  getByCategory: async (category) => {
    const response = await api.get('/products', {
      params: { category, pageSize: 100 },
    })
    return unwrapProductList(response.data)
  },

  search: async (query) => {
    const response = await api.get('/products', {
      params: { search: query, pageSize: 100 },
    })
    return unwrapProductList(response.data)
  },

  // ── Single-product reads ─────────────────────────────────────────────
  getById: async (id) => {
    const response = await api.get(`/products/${id}`)
    return unwrapProductItem(response.data)
  },

  // ── Admin CRUD ───────────────────────────────────────────────────────
  create: async (payload) => {
    const response = await api.post('/products', payload)
    return response.data
  },

  update: async (id, payload) => {
    const response = await api.patch(`/products/${id}`, payload)
    return response.data
  },

  remove: async (id) => {
    const response = await api.delete(`/products/${id}`)
    return response.data
  },
}

// The backend now wraps every product in a stats envelope. Unwrap to the
// product document so existing consumers keep working with the bare shape.
// Tolerates both the paginated envelope (`.items`) and a bare array, plus the
// per-product `{product, soldCounts, rating}` wrapper.
function unwrapProductList(data) {
  if (!data) return []
  // Paginated envelope shape.
  if (Array.isArray(data.items)) {
    return data.items.map(unwrapProductItem)
  }
  // Already a flat array.
  if (Array.isArray(data)) {
    return data.map(unwrapProductItem)
  }
  return []
}

function unwrapProductItem(item) {
  if (!item) return null
  // Old shape (bare product) — pass through.
  if (!item.product) return item
  // New shape: pull the product out but keep the stats as a sibling property
  // on the returned object so the FE can use them when flattening SKUs.
  return {
    ...item.product,
    _soldCounts: item.soldCounts || {},
    _rating: item.rating || { avg: 0, count: 0 },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// USER API
// ─────────────────────────────────────────────────────────────────────────────

export const userApi = {
  getAll: async () => {
    const response = await api.get('/users')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  create: async (payload) => {
    const response = await api.post('/users', payload)
    return response.data
  },

  update: async (id, payload) => {
    const response = await api.patch(`/users/${id}`, payload)
    return response.data
  },

  remove: async (id) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

  changePassword: async (id, currentPassword, newPassword) => {
    const response = await api.post(`/users/${id}/change-password`, {
      currentPassword,
      newPassword,
    })
    return response.data
  },

  adminResetPassword: async (id, newPassword) => {
    const response = await api.post(`/users/${id}/change-password`, {
      currentPassword: '',
      newPassword,
    })
    return response.data
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY API
// ─────────────────────────────────────────────────────────────────────────────

export const categoryApi = {
  /** Flat list (legacy admin flat view). */
  getAll: async () => {
    const response = await api.get('/categories')
    return response.data
  },

  /**
   * Full N-level tree (CategoryNode[]). Roots first; each node carries its
   * `children` list recursively. Used by the storefront mega-menu / filter
   * sidebar and by the admin tree view.
   */
  getTree: async () => {
    const response = await api.get('/categories/tree')
    return response.data || []
  },

  getById: async (id) => {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },

  create: async (payload) => {
    // `parentId` is optional — undefined/empty produces a root category.
    const response = await api.post('/categories', payload)
    return response.data
  },

  update: async (id, payload) => {
    const response = await api.patch(`/categories/${id}`, payload)
    return response.data
  },

  remove: async (id) => {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDER API
// ─────────────────────────────────────────────────────────────────────────────

export const orderApi = {
  create: async (orderData) => {
    const response = await api.post('/orders', orderData)
    return response.data
  },

  getAll: async () => {
    const response = await api.get('/orders')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },

  updateStatus: async (id, status, note) => {
    const response = await api.patch(`/orders/${id}/status`, { status, note })
    return response.data
  },

  getStatusLogs: async (id) => {
    const response = await api.get(`/orders/${id}/status-logs`)
    return response.data
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD API
// ─────────────────────────────────────────────────────────────────────────────

export const uploadApi = {
  // Single-file upload. Returns { url, size }. url is a relative path
  // like "/uploads/2026/08/abc.jpg" — prepend the API origin to render.
  upload: async (file, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    const response = await api.post('/uploads', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded * 100) / event.total))
        }
      },
    })
    return response.data
  },

  // Delete a previously uploaded file by its relative url.
  remove: async (url) => {
    await api.delete('/uploads', { params: { url } })
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },
  register: async (payload) => {
    const response = await api.post('/auth/register', payload)
    return response.data
  },
  me: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW API
// ─────────────────────────────────────────────────────────────────────────────

export const reviewApi = {
  // GET /api/reviews?productId=...&variantSku=...&limit=20
  // → { reviews: [...], aggregate: { avg, count } }
  list: async ({ productId, variantSku = null, limit = 20 } = {}) => {
    const params = { productId, limit }
    if (variantSku) params.variantSku = variantSku
    const response = await api.get('/reviews', { params })
    return response.data
  },

  // POST /api/reviews — requires JWT. The server fills userId from the token.
  create: async ({ productId, variantSku = null, rating, comment = '' }) => {
    const response = await api.post('/reviews', {
      productId,
      variantSku,
      rating,
      comment,
    })
    return response.data
  },
}

export default api