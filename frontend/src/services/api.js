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

export const productApi = {
  // All listing endpoints return a list of { product, soldCounts, rating }
  // (see backend DTO ProductWithStats). The product itself is in `.product`
  // and the stats are in `.soldCounts` (per SKU) + `.rating` (product-level).
  getAll: async (category = null) => {
    const params = category ? { category } : {}
    const response = await api.get('/products', { params })
    return unwrapProductList(response.data)
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`)
    return unwrapProductItem(response.data)
  },

  getByCategory: async (category) => {
    const response = await api.get('/products', {
      params: { category },
    })
    return unwrapProductList(response.data)
  },

  search: async (query) => {
    const response = await api.get('/products', {
      params: { search: query },
    })
    return unwrapProductList(response.data)
  },

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
function unwrapProductList(data) {
  if (!Array.isArray(data)) return []
  return data.map(unwrapProductItem)
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

export const categoryApi = {
  getAll: async () => {
    const response = await api.get('/categories')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },

  create: async (payload) => {
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
