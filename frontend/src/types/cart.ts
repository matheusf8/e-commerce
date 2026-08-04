// Cart types
export interface CartItem {
  id: string
  product_id: string
  product_name: string
  price: number
  quantity: number
  subtotal: number
}

export interface Cart {
  id: string
  user_id: string
  items: CartItem[]
  total: number
  item_count: number
}

export interface AddToCartRequest {
  product_id: string
  quantity: number
}
