import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, ShoppingCart, Heart, Check, Truck, Shield, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { productService, reviewService } from '@/services/api'
import { useAuthStore, useCartStore } from '@/store'
import { api } from '@/services/api'

export function ProductDetail() {
  const { productId } = useParams()
  const { isAuthenticated } = useAuthStore()
  const [product, setProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const addItemToCart = useCartStore(state => state.addItemToCart)

  useEffect(() => {
    loadProduct()
  }, [productId])

  useEffect(() => {
    if (product && isAuthenticated) checkWishlist()
  }, [product, isAuthenticated])

  const loadProduct = async () => {
    if (!productId) return
    setIsLoading(true)
    try {
      const response = await productService.getById(productId)
      const data = response.data
      setProduct(data)
      setQuantity(1)

      try {
        const revRes = await reviewService.getByProduct(productId)
        setReviews(revRes.data.items || revRes.data || [])
      } catch {}

      if (data.category) {
        try {
          const relRes = await productService.getAll(0, 4, data.category)
          const allProds = relRes.data.items || []
          setRelatedProducts(allProds.filter((p: any) => p.id !== productId).slice(0, 4))
        } catch {}
      }
    } catch (error) {
      console.error('Failed to load product:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkWishlist = async () => {
    try {
      const res = await api.get('/wishlist')
      const items = res.data.items || []
      setIsWishlisted(items.some((i: any) => i.product_id === productId))
    } catch {}
  }

  const handleAddToCart = async () => {
    if (!product) return
    await addItemToCart(product.id, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 3000)
  }

  const handleWishlist = async () => {
    if (!isAuthenticated || !product) return
    try {
      if (isWishlisted) {
        const res = await api.get('/wishlist')
        const item = res.data.items?.find((i: any) => i.product_id === product.id)
        if (item) await api.delete('/wishlist/' + item.id)
        setIsWishlisted(false)
      } else {
        await api.post('/wishlist/' + product.id)
        setIsWishlisted(true)
      }
    } catch (err) {
      console.error('Wishlist error:', err)
    }
  }

  const renderStars = (rating: number, size = 20) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} size={size}
        className={i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ))
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center py-24">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Carregando produto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold mb-4">Produto nao encontrado</h2>
        <Link to="/catalog"><Button>Voltar ao Catalogo</Button></Link>
      </div>
    )
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/catalog" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6">
        <ArrowLeft size={20} />
        <span>Voltar ao Catalogo</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl h-96 lg:h-[500px] flex items-center justify-center overflow-hidden relative group">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="h-full w-full object-contain p-8 group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="text-gray-300 text-center">
                <ShoppingCart size={96} className="mx-auto mb-4" />
                <span className="text-lg">Sem imagem disponivel</span>
              </div>
            )}
            {discount > 0 && (
              <span className="absolute top-6 left-6 bg-red-500 text-white font-bold px-4 py-2 rounded-full text-lg shadow-lg">
                -{discount}%
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold mb-2 uppercase tracking-wide">
            {product.category}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex">{renderStars(product.rating || 0)}</div>
            <span className="text-gray-600 font-semibold">{product.rating?.toFixed(1)}</span>
            <span className="text-gray-400">({product.review_count} avaliacoes)</span>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-bold text-blue-600">R$ {product.price.toFixed(2)}</span>
              {product.original_price && (
                <span className="text-2xl text-gray-400 line-through">R$ {product.original_price.toFixed(2)}</span>
              )}
            </div>
            {discount > 0 && (
              <p className="text-green-600 font-semibold mt-2">Economia de R$ {(product.original_price - product.price).toFixed(2)}</p>
            )}
          </div>

          <p className="text-gray-700 text-lg leading-relaxed mb-8">{product.description}</p>

          <div className="mb-8">
            {product.stock > 0 ? (
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <Check size={20} />
                <span>{product.stock} unidades em estoque</span>
              </div>
            ) : (
              <div className="text-red-600 font-semibold">Produto indisponivel</div>
            )}
          </div>

          {product.stock > 0 && (
            <Card className="p-6 mb-8 border-2 border-blue-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantidade:</label>
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 hover:bg-gray-100 transition-colors font-bold"
                    >-</button>
                    <input type="number" min="1" max={product.stock} value={quantity}
                      onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-16 text-center border-x py-3 font-semibold"
                    />
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-3 hover:bg-gray-100 transition-colors font-bold"
                    >+</button>
                  </div>
                </div>
                <Button className="flex-1 py-4 text-lg font-bold flex items-center justify-center gap-2"
                  onClick={handleAddToCart} disabled={addedToCart}
                >
                  {addedToCart ? (
                    <><Check size={24} /> Adicionado ao Carrinho!</>
                  ) : (
                    <><ShoppingCart size={24} /> Adicionar ao Carrinho</>
                  )}
                </Button>
                <Button variant="outline" className={"py-4 px-6 " + (isWishlisted ? "text-red-500 border-red-300" : "")}
                  onClick={handleWishlist}
                >
                  <Heart size={24} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
                </Button>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
              <Truck size={24} className="text-blue-600" />
              <div>
                <p className="font-semibold text-sm">Frete Gratis</p>
                <p className="text-xs text-gray-500">Acima de R$ 200</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
              <Shield size={24} className="text-blue-600" />
              <div>
                <p className="font-semibold text-sm">Garantia</p>
                <p className="text-xs text-gray-500">1 ano de garantia</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
              <ShoppingCart size={24} className="text-blue-600" />
              <div>
                <p className="font-semibold text-sm">Devolucao</p>
                <p className="text-xs text-gray-500">7 dias gratis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Avaliacoes dos Clientes</h2>
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Star size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhuma avaliacao ainda</p>
            {isAuthenticated && (
              <p className="text-gray-400 mt-2">Seja o primeiro a avaliar este produto</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review: any, i: number) => (
              <Card key={i} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {(review.user_name || "U").charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{review.user_name || "Usuario"}</p>
                        <div className="flex">{renderStars(review.rating || 5, 14)}</div>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-2">{review.comment || "Otimo produto!"}</p>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(review.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Produtos Relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((rp: any) => (
              <Link key={rp.id} to={"/product/" + rp.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-40 bg-gray-100">
                    {rp.image_url ? (
                      <img src={rp.image_url} alt={rp.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                        <ShoppingCart size={32} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm truncate">{rp.name}</h3>
                    <p className="text-blue-600 font-bold mt-1">R$ {rp.price.toFixed(2)}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

