// Order types
export interface OrderItem {
  id: string
  product_id: string
  product_name: string
  price: number
  quantity: number
  subtotal: number
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  items: OrderItem[]
  shipping_address: string
  created_at: string
}

export interface CreateOrderRequest {
  shipping_address: string
  city: string
  state: string
  zip_code: string
  payment_method: string
}

export interface OrdersResponse {
  items: Order[]
}
