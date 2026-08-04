import { Product } from '@/types/product'
import { ProductCard } from './ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
  onAddToCart?: (productId: string) => void
  onAddToWishlist?: (productId: string) => void
}

export function ProductGrid({
  products,
  isLoading = false,
  onAddToCart,
  onAddToWishlist,
}: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton count={6} />
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
        />
      ))}
    </div>
  )
}
