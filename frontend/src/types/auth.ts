// User types
export interface User {
  id: string
  email: string
  full_name: string
  is_active: boolean
  is_admin: boolean
  phone: string
  address: string
  city: string
  state: string
  zip_code: string
  total_orders: number
  total_spent: number
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
}

export interface AuthResponse {
  access_token: string
  refresh_token?: string
  token_type: string
}
