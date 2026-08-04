import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/store'
import { api } from '@/services/api'
import toast from 'react-hot-toast'

export function Wishlist() {
  const { isAuthenticated } = useAuthStore()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) loadWishlist()
    else setLoading(false)
  }, [isAuthenticated])

  const loadWishlist = async () => {
    try {
      const res = await api.get('/wishlist')
      setItems(res.data.items || [])
    } catch (err) {
      console.error('Failed to load wishlist:', err)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      await api.delete('/wishlist/' + itemId)
      setItems(prev => prev.filter(i => i.id !== itemId))
    } catch (err) {
      console.error('Failed to remove item:', err)
    }
  }

  const moveToCart = async (productId: string) => {
    try {
      await api.post('/cart/items', { product_id: productId, quantity: 1 })
      toast.success('Produto adicionado ao carrinho!')
    } catch (err) {
      console.error('Failed to add to cart:', err)
      toast.error('Erro ao adicionar ao carrinho')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando lista de desejos...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Heart size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Lista de Desejos</h1>
        <p className="text-gray-600 mb-6">Faça login para ver sua lista de desejos</p>
        <Link to="/login"><Button>Entrar</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/catalog" className="text-gray-600 hover:text-blue-600">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Minha Lista de Desejos</h1>
        {items.length > 0 && (
          <span className="text-gray-500">({items.length} itens)</span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={80} className="mx-auto text-gray-200 mb-6" />
          <h2 className="text-2xl font-semibold mb-4">Sua lista está vazia</h2>
          <p className="text-gray-600 mb-6">Adicione produtos aos favoritos para comprá-los depois</p>
          <Link to="/catalog"><Button>Explorar Produtos</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <Link to={"/product/" + item.product_id}>
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  {item.product?.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                      <Heart size={48} className="text-blue-200" />
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link to={"/product/" + item.product_id}>
                  <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600">{item.product?.name}</h3>
                </Link>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-bold text-blue-600">R$ {item.product?.price?.toFixed(2)}</span>
                  {item.product?.original_price && (
                    <span className="text-sm text-gray-500 line-through">R$ {item.product.original_price.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 flex items-center justify-center gap-1" onClick={() => moveToCart(item.product_id)}>
                    <ShoppingCart size={16} /> Adicionar
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => removeItem(item.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

