import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuthStore, useCartStore } from '@/store'

export function Cart() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { items, total, itemCount, isLoading, fetchCart, updateQuantity, removeItem, clearCart } = useCartStore()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) fetchCart()
  }, [isAuthenticated])

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return
    setUpdatingId(itemId)
    await updateQuantity(itemId, newQty)
    setUpdatingId(null)
  }

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingId(itemId)
    await removeItem(itemId)
    setUpdatingId(null)
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-3xl font-bold mb-4">Carrinho de Compras</h1>
        <p className="text-gray-600 mb-6">Faça login para ver seu carrinho</p>
        <Link to="/login"><Button>Entrar</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Carrinho</h1>
          {itemCount > 0 && (
            <span className="text-gray-500">({itemCount} itens)</span>
          )}
        </div>
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearCart} className="text-red-500 border-red-200">
            <Trash2 size={16} className="mr-1" /> Limpar
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag size={80} className="mx-auto text-gray-200 mb-6" />
          <h2 className="text-2xl font-semibold mb-4">Seu carrinho esta vazio</h2>
          <p className="text-gray-600 mb-6">Adicione produtos para comecar a comprar</p>
          <Link to="/catalog"><Button>Ver Catalogo</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className={"p-6 " + (updatingId === item.id ? 'opacity-50' : '')}>
              <div className="flex items-center gap-6">
                <Link to={"/product/" + item.product_id} className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingBag size={32} />
                    </div>
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={"/product/" + item.product_id}>
                    <h3 className="font-semibold text-gray-900 truncate hover:text-blue-600">{item.product_name}</h3>
                  </Link>
                  <p className="text-xl font-bold text-blue-600 mt-1">R$ {(item.subtotal || 0).toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-gray-100">
                      <Minus size={16} />
                    </button>
                    <span className="px-4 font-semibold">{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-gray-100">
                      <Plus size={16} />
                    </button>
                  </div>
                  <button onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </Card>
          ))}

          <Card className="p-6 sticky bottom-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">{itemCount} itens no carrinho</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">R$ {total.toFixed(2)}</p>
              </div>
              <Button className="py-4 px-8 text-lg font-bold" onClick={() => navigate('/checkout')}>
                Finalizar Compra
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

