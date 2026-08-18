import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
      params: { category } 
    })
    return response.data
  },
}

export const orderApi = {
  create: async (orderData) => {
    const response = await api.post('/orders', orderData)
    return response.data
  },
}

export default api
