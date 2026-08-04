import { create } from 'zustand'
import { CartItem } from '@/types/cart'
import { api } from '@/services/api'
import toast from 'react-hot-toast'

interface CartStore {
  items: CartItem[]
  total: number
  itemCount: number
  isLoading: boolean
  
  fetchCart: () => Promise<void>
  addItemToCart: (productId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  setItems: (items: CartItem[]) => void
  calculateTotals: () => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true })
    try {
      const res = await api.get('/cart')
      const data = res.data
      set({
        items: data.items || [],
        total: data.total || 0,
        itemCount: data.item_count || 0,
        isLoading: false
      })
    } catch (err) {
      console.error('Failed to fetch cart:', err)
      set({ isLoading: false })
    }
  },

  addItemToCart: async (productId, quantity) => {
    try {
      await api.post('/cart/items', { product_id: productId, quantity })
      toast.success('Adicionado ao carrinho!')
      await get().fetchCart()
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Erro ao adicionar ao carrinho'
      toast.error(msg)
      console.error('Failed to add to cart:', err)
    }
  },

  removeItem: async (itemId) => {
    try {
      await api.delete(`/cart/items/${itemId}`)
      set({ items: get().items.filter(i => i.id !== itemId) })
      get().calculateTotals()
      toast.success('Item removido do carrinho')
    } catch (err) {
      console.error('Failed to remove item:', err)
      toast.error('Erro ao remover item')
    }
  },

  updateQuantity: async (itemId, quantity) => {
    if (quantity < 1) return
    try {
      await api.put(`/cart/items/${itemId}`, { quantity })
      const { items } = get()
      const item = items.find(i => i.id === itemId)
      if (item) {
        item.quantity = quantity
      }
      set({ items })
      get().calculateTotals()
    } catch (err) {
      console.error('Failed to update quantity:', err)
      toast.error('Erro ao atualizar quantidade')
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart')
      set({ items: [], total: 0, itemCount: 0 })
      toast.success('Carrinho limpo')
    } catch (err) {
      console.error('Failed to clear cart:', err)
      toast.error('Erro ao limpar carrinho')
    }
  },

  setItems: (items) => {
    set({ items })
    get().calculateTotals()
  },

  calculateTotals: () => {
    const { items } = get()
    const total = items.reduce((sum, item) => sum + (item.subtotal || 0), 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    set({ total, itemCount })
  },
}))
