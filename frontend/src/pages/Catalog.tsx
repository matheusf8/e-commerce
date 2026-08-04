import { useEffect, useState } from 'react'
import { ProductGrid } from '@/components/product/ProductGrid'
import { useProductStore } from '@/store'
import { useCartStore } from '@/store'
import { productService } from '@/services/api'

export function Catalog() {
  const {
    products,
    filteredProducts,
    isLoading,
    selectedCategory,
    searchQuery,
    setProducts,
    setLoading,
    setSelectedCategory,
    setSearchQuery,
    filterByCategoryAndSearch,
  } = useProductStore()

  const addItemToCart = useCartStore(state => state.addItemToCart)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  useEffect(() => {
    filterByCategoryAndSearch()
  }, [selectedCategory, searchQuery])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await productService.getAll()
      setProducts(response.data.items)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await productService.getCategories()
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const handleAddToCart = async (productId: string) => {
    await addItemToCart(productId, 1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Catálogo</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-semibold mb-2">Categorias</label>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition ${
                    selectedCategory === null
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  Todas
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="md:col-span-3">
          <ProductGrid
            products={filteredProducts.length > 0 ? filteredProducts : products}
            isLoading={isLoading}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>
    </div>
  )
}
