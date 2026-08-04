import React from "react"
import { ShoppingCart, Heart, Star, Eye, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Link } from "react-router-dom"
import { useAuthStore } from "@/store"
import { api } from "@/services/api"

interface ProductCardProps {
  product: any
  onAddToCart?: (id: string) => void
  onAddToWishlist?: (id: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [imageError, setImageError] = React.useState(false)
  const [isWishlisted, setIsWishlisted] = React.useState(false)
  const [addedToCart, setAddedToCart] = React.useState(false)
  const { isAuthenticated } = useAuthStore()

  React.useEffect(() => {
    if (isAuthenticated && product?.id) {
      checkWishlistStatus()
    }
  }, [isAuthenticated, product?.id])

  const checkWishlistStatus = async () => {
    try {
      const res = await api.get("/wishlist")
      const items = res.data.items || []
      setIsWishlisted(items.some((i: any) => i.product_id === product.id))
    } catch {}
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated || !product?.id) return
    try {
      if (isWishlisted) {
        const res = await api.get("/wishlist")
        const item = res.data.items?.find((i: any) => i.product_id === product.id)
        if (item) {
          await api.delete("/wishlist/" + item.id)
          setIsWishlisted(false)
        }
      } else {
        await api.post("/wishlist/" + product.id)
        setIsWishlisted(true)
      }
    } catch (err) {
      console.error("Wishlist error:", err)
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onAddToCart) {
      onAddToCart(product.id)
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    }
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
      />
    ))
  }

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300">
      <Link to={"/product/" + product.id} className="block">
        <div className="relative h-56 bg-gray-100 overflow-hidden">
          {product.is_featured && (
            <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Destaque
            </span>
          )}
          {discount > 0 && (
            <span className="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              -{discount}%
            </span>
          )}
          <div className="relative h-full image-zoom">
            {imageError || !product.image_url ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-gray-400 text-center">
                  <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
                  <span className="text-sm">{product.name?.charAt(0) || "?"}</span>
                </div>
              </div>
            ) : (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            )}
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button
              onClick={handleWishlist}
              className="bg-white p-3 rounded-full hover:bg-red-50 transition-colors"
              title={isWishlisted ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Heart
                size={20}
                className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-700"}
              />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.location.href = "/product/" + product.id
              }}
              className="bg-white p-3 rounded-full hover:bg-blue-50 transition-colors"
            >
              <Eye size={20} className="text-gray-700" />
            </button>
          </div>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center gap-1 mb-2">
          {renderStars(product.rating || 0)}
          <span className="text-xs text-gray-500 ml-1">({product.review_count || 0})</span>
        </div>
        <Link to={"/product/" + product.id}>
          <h3 className="font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors truncate">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">{product.category}</p>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold text-blue-600">
            R$ {(product.price || 0).toFixed(2)}
          </span>
          {product.original_price && (
            <span className="text-sm text-gray-400 line-through">
              R$ {product.original_price.toFixed(2)}
            </span>
          )}
        </div>
        <Button
          className="w-full flex items-center justify-center gap-2 transition-all"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
        >
          {addedToCart ? (
            <>
              <Check size={18} className="text-green-300" />
              Adicionado
            </>
          ) : product.stock > 0 ? (
            <>
              <ShoppingCart size={18} />
              Adicionar ao Carrinho
            </>
          ) : (
            "Sem Estoque"
          )}
        </Button>
      </div>
    </Card>
  )
}
