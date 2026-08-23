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
  getAll: async (category = null) => {
    const params = category ? { category } : {}
    const response = await api.get('/products', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  getByCategory: async (category) => {
    const response = await api.get('/products', {
      params: { category },
    })
    return response.data
  },

  search: async (query) => {
    const response = await api.get('/products', {
      params: { search: query },
    })
    return response.data
  },

  create: async (payload) => {
    const response = await api.post('/products', payload)
    return response.data
  },

  update: async (id, payload) => {
    const response = await api.put(`/products/${id}`, payload)
    return response.data
  },

  remove: async (id) => {
    const response = await api.delete(`/products/${id}`)
    return response.data
  },
}

export const orderApi = {
  create: async (orderData) => {
    const response = await api.post('/orders', orderData)
    return response.data
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

export default api
