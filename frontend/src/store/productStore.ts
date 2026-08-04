import { create } from 'zustand'
import { Product } from '@/types/product'

interface ProductStore {
  products: Product[]
  filteredProducts: Product[]
  selectedProduct: Product | null
  isLoading: boolean
  selectedCategory: string | null
  searchQuery: string
  
  setProducts: (products: Product[]) => void
  setFilteredProducts: (products: Product[]) => void
  setSelectedProduct: (product: Product | null) => void
  setLoading: (loading: boolean) => void
  setSelectedCategory: (category: string | null) => void
  setSearchQuery: (query: string) => void
  filterByCategoryAndSearch: () => void
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  filteredProducts: [],
  selectedProduct: null,
  isLoading: false,
  selectedCategory: null,
  searchQuery: '',

  setProducts: (products) => set({ products }),

  setFilteredProducts: (filteredProducts) => set({ filteredProducts }),

  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),

  setLoading: (isLoading) => set({ isLoading }),

  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  filterByCategoryAndSearch: () => {
    const { products, selectedCategory, searchQuery } = get()
    
    let filtered = [...products]
    
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      )
    }
    
    set({ filteredProducts: filtered })
  },
}))
