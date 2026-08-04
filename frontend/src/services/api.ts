import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          })
          
          localStorage.setItem('access_token', response.data.access_token)
          return api.request(error.config)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// Auth Service
export const authService = {
  register: (email: string, password: string, fullName: string) =>
    api.post('/auth/register', { email, password, full_name: fullName }),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  getProfile: () => api.get('/auth/me'),

  logout: () => api.post('/auth/logout'),

  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, new_password: newPassword }),
}

// Products Service
export const productService = {
  getAll: (skip?: number, limit?: number, category?: string, search?: string) =>
    api.get('/products', { params: { skip, limit, category, search } }),
  
  getById: (id: string) => api.get(`/products/${id}`),
  
  getFeatured: () => api.get('/products/featured'),
  
  search: (q: string) => api.get('/products/search', { params: { q } }),
  
  getCategories: () => api.get('/products/categories'),
  
  create: (data: any) => api.post('/products', data),
  
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  
  delete: (id: string) => api.delete(`/products/${id}`),
}

// Cart Service
export const cartService = {
  getCart: () => api.get('/cart'),
  
  addItem: (productId: string, quantity: number) =>
    api.post('/cart/items', { product_id: productId, quantity }),
  
  updateItem: (itemId: string, quantity: number) =>
    api.put(`/cart/items/${itemId}`, { quantity }),
  
  removeItem: (itemId: string) => api.delete(`/cart/items/${itemId}`),
  
  clear: () => api.delete('/cart'),
}

// Orders Service
export const orderService = {
  create: (data: any) => api.post('/orders', data),
  
  getMyOrders: (skip?: number, limit?: number) =>
    api.get('/orders/my-orders', { params: { skip, limit } }),
  
  getById: (id: string) => api.get(`/orders/${id}`),
  
  cancel: (id: string) => api.post(`/orders/${id}/cancel`),
  
  getAllOrders: (skip?: number, limit?: number) =>
    api.get('/orders', { params: { skip, limit } }),
  
  updateStatus: (id: string, status: string) =>
    api.put(`/orders/${id}/status`, { status }),
}

// Reviews Service
export const reviewService = {
  getByProduct: (productId: string, skip?: number, limit?: number) =>
    api.get(`/reviews/${productId}`, { params: { skip, limit } }),
  
  create: (productId: string, data: any) =>
    api.post(`/reviews/${productId}`, data),
  
  update: (id: string, data: any) => api.put(`/reviews/${id}`, data),
  
  delete: (id: string) => api.delete(`/reviews/${id}`),
}
