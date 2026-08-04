// Product types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  original_price?: number
  category: string
  stock: number
  rating: number
  review_count: number
  image_url: string
  is_featured: boolean
  created_at: string
}

export interface ProductCreateRequest {
  name: string
  description: string
  price: number
  category: string
  stock: number
  image_url: string
}

export interface ProductsResponse {
  items: Product[]
  total: number
  skip: number
  limit: number
}
