const fs = require('fs');
const path = 'c:/Users/mathe/OneDrive/Desktop/area_trabalho/pasta/sistema-de-E-commerce';

// ===== 1. BACKEND: WISHLIST API =====
const wishlistApi = `"""Wishlist endpoints"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.auth import get_current_user
from app.models import User, WishlistItem, Product

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])

@router.get("")
async def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user wishlist"""
    items = db.query(WishlistItem).filter(WishlistItem.user_id == current_user.id).all()
    products = []
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            products.append({
                "id": item.id,
                "product_id": product.id,
                "product": {
                    "id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "original_price": product.original_price,
                    "image_url": product.image_url,
                    "rating": product.rating,
                    "review_count": product.review_count,
                    "category": product.category,
                    "stock": product.stock,
                },
                "created_at": str(item.created_at)
            })
    return {"items": products, "count": len(products)}

@router.post("/{product_id}", status_code=status.HTTP_201_CREATED)
async def add_to_wishlist(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add product to wishlist"""
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not product:
        from fastapi import HTTPException
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    existing = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == product_id
    ).first()
    
    if existing:
        from fastapi import HTTPException
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product already in wishlist")
    
    item = WishlistItem(user_id=current_user.id, product_id=product_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"message": "Product added to wishlist", "id": item.id}

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_wishlist(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove item from wishlist"""
    item = db.query(WishlistItem).filter(
        WishlistItem.id == item_id,
        WishlistItem.user_id == current_user.id
    ).first()
    
    if not item:
        from fastapi import HTTPException
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wishlist item not found")
    
    db.delete(item)
    db.commit()
    return {"message": "Product removed from wishlist"}

@router.get("/check/{product_id}")
async def check_wishlist(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if product is in wishlist"""
    existing = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == product_id
    ).first()
    return {"in_wishlist": existing is not None}
`;

// Update __init__.py to include wishlist
const apiInit = `"""API Routes"""
from fastapi import APIRouter
from app.api import auth, products, cart, orders, reviews, wishlist

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(products.router)
api_router.include_router(cart.router)
api_router.include_router(orders.router)
api_router.include_router(reviews.router)
api_router.include_router(wishlist.router)

__all__ = ["api_router"]
`;

fs.writeFileSync(path + '/backend/app/api/wishlist.py', wishlistApi, 'utf8');
fs.writeFileSync(path + '/backend/app/api/__init__.py', apiInit, 'utf8');
console.log('1. Backend wishlist API created');

// ===== 2. FRONTEND: WISHLIST PAGE =====
const wishlistPage = `import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/store'
import { api } from '@/services/api'

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
      alert('Produto adicionado ao carrinho!')
    } catch (err) {
      console.error('Failed to add to cart:', err)
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
`;

fs.writeFileSync(path + '/frontend/src/pages/Wishlist.tsx', wishlistPage, 'utf8');
console.log('2. Wishlist page created');

// ===== 3. FRONTEND: COMPLETE Home.tsx =====
const homePage = `import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Truck, Shield, CreditCard, HeadphonesIcon, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProductGrid } from "@/components/product/ProductGrid";
import { productService } from "@/services/api";

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const response = await productService.getFeatured();
      setFeaturedProducts(response.data.items || response.data || []);
    } catch (error) {
      console.error("Failed to load featured products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    { icon: Truck, title: "Frete Grátis", desc: "Em compras acima de R$ 200" },
    { icon: Shield, title: "Compra Segura", desc: "Dados protegidos com criptografia" },
    { icon: CreditCard, title: "Parcele em 12x", desc: "No cartão de crédito" },
    { icon: HeadphonesIcon, title: "Suporte 24/7", desc: "Atendimento online" },
  ];

  const categories = [
    { name: "Eletrônicos", image: "/eletronicos.jpg", count: "45 produtos", color: "from-blue-500 to-blue-700" },
    { name: "Acessórios", image: "/acessorios.jpg", count: "32 produtos", color: "from-purple-500 to-purple-700" },
    { name: "Moda", image: "/moda.jpg", count: "28 produtos", color: "from-pink-500 to-pink-700" },
    { name: "Casa", image: "/casa.jpg", count: "20 produtos", color: "from-green-500 to-green-700" },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 text-sm">
              <Zap size={16} className="text-yellow-300" />
              <span>Nova coleção 2024 com até 40% OFF</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight text-white">
              Descubra o{" "}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 text-transparent bg-clip-text">
                Melhor
              </span>{" "}
              em Tecnologia
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto">
              Os melhores produtos com preços incríveis, entrega rápida e garantia de qualidade.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/catalog">
                <Button variant="white" size="lg" className="text-blue-700 font-bold text-lg px-8 py-4">
                  Ver Catálogo
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8 py-4">
                  Sobre Nós
                </Button>
              </Link>
            </div>
            
            <div className="mt-16 flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Star size={20} className="text-yellow-300 fill-yellow-300" />
                <span>4.9 de 5 estrelas</span>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <span>+10.000 clientes</span>
              <div className="w-px h-8 bg-white/20"></div>
              <span>Entrega em todo Brasil</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon size={28} className="text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Produtos em Destaque</h2>
              <p className="text-gray-600 mt-2">Os produtos mais vendidos da semana</p>
            </div>
            <Link to="/catalog">
              <Button variant="outline">
                Ver Todos <ArrowRight size={16} className="ml-1" />
              </Button>
            </Link>
          </div>
          <ProductGrid products={featuredProducts} isLoading={isLoading} />
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Categorias</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, index) => (
              <Link key={index} to={"/catalog?category=" + cat.name} className="group">
                <div className={"relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br " + cat.color}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
                      <p className="text-sm text-white/80">{cat.count}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all"></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Pronto para Comprar?</h2>
          <p className="text-xl text-blue-100 mb-8">Cadastre-se agora e ganhe 10% de desconto na primeira compra!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="white" size="lg" className="text-blue-700 font-bold px-8">
                Criar Conta Grátis
              </Button>
            </Link>
            <Link to="/catalog">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8">
                Continuar Navegando
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Fique por Dentro</h3>
          <p className="text-gray-400 mb-6">Receba ofertas exclusivas e novidades no seu email</p>
          <form className="flex gap-2" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="Seu melhor email"
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6">
              Inscrever
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
`;

fs.writeFileSync(path + '/frontend/src/pages/Home.tsx', homePage, 'utf8');
console.log('3. Home page created');

// ===== 4. FRONTEND: COMPLETE ProductCard.tsx =====
const productCard = `import React from "react";
import { ShoppingCart, Heart, Star, Eye, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store";
import { api } from "@/services/api";

interface ProductCardProps {
  product: any;
  onAddToCart?: (id: string) => void;
  onAddToWishlist?: (id: string) => void;
}

export function ProductCard({ product, onAddToCart, onAddToWishlist }: ProductCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [addedToCart, setAddedToCart] = React.useState(false);
  const { isAuthenticated } = useAuthStore();

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    
    try {
      if (isWishlisted) {
        // Find and remove from wishlist
        const res = await api.get("/wishlist");
        const item = res.data.items?.find((i: any) => i.product_id === product.id);
        if (item) {
          await api.delete("/wishlist/" + item.id);
          setIsWishlisted(false);
        }
      } else {
        await api.post("/wishlist/" + product.id);
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product.id);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
      />
    ));
  };

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300">
      <Link to={"/product/" + product.id}>
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

          {/* Hover Actions */}
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
            <Link to={"/product/" + product.id}>
              <button className="bg-white p-3 rounded-full hover:bg-blue-50 transition-colors">
                <Eye size={20} className="text-gray-700" />
              </button>
            </Link>
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
  );
}
`;

fs.writeFileSync(path + '/frontend/src/components/product/ProductCard.tsx', productCard, 'utf8');
console.log('4. ProductCard created');

// ===== 5. FRONTEND: COMPLETE ProductDetail.tsx =====
const productDetail = `import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, ShoppingCart, Heart, Check, Truck, Shield, ArrowLeft, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { productService, reviewService } from '@/services/api'
import { useAuthStore } from '@/store'
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
      
      // Load reviews
      try {
        const revRes = await reviewService.getByProduct(productId)
        setReviews(revRes.data.items || revRes.data || [])
      } catch {}
      
      // Load related products (same category)
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
    try {
      await api.post('/cart/items', { product_id: product.id, quantity })
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 3000)
    } catch (err) {
      console.error('Failed to add to cart:', err)
    }
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
      <Star
        key={i}
        size={size}
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
        <h2 className="text-2xl font-bold mb-4">Produto não encontrado</h2>
        <Link to="/catalog"><Button>Voltar ao Catálogo</Button></Link>
      </div>
    )
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back button */}
      <Link to="/catalog" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6">
        <ArrowLeft size={20} />
        <span>Voltar ao Catálogo</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl h-96 lg:h-[500px] flex items-center justify-center overflow-hidden relative group">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="h-full w-full object-contain p-8 group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="text-gray-300 text-center">
                <ShoppingCart size={96} className="mx-auto mb-4" />
                <span className="text-lg">Sem imagem disponível</span>
              </div>
            )}
            
            {discount > 0 && (
              <span className="absolute top-6 left-6 bg-red-500 text-white font-bold px-4 py-2 rounded-full text-lg shadow-lg">
                -{discount}%
              </span>
            )}

            <button onClick={() => {}} className="absolute top-6 right-6 bg-white p-3 rounded-full shadow-lg hover:bg-red-50 transition-colors">
              <Share2 size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold mb-2 uppercase tracking-wide">
            {product.category}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex">{renderStars(product.rating || 0)}</div>
            <span className="text-gray-600 font-semibold">{product.rating?.toFixed(1)}</span>
            <span className="text-gray-400">({product.review_count} avaliações)</span>
          </div>

          {/* Price */}
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

          {/* Description */}
          <p className="text-gray-700 text-lg leading-relaxed mb-8">{product.description}</p>

          {/* Stock */}
          <div className="mb-8">
            {product.stock > 0 ? (
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <Check size={20} />
                <span>{product.stock} unidades em estoque</span>
              </div>
            ) : (
              <div className="text-red-600 font-semibold">Produto indisponível</div>
            )}
          </div>

          {/* Add to cart */}
          {product.stock > 0 && (
            <Card className="p-6 mb-8 border-2 border-blue-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantidade:</label>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 hover:bg-gray-100 transition-colors font-bold"
                    >-</button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-16 text-center border-x py-3 font-semibold"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-3 hover:bg-gray-100 transition-colors font-bold"
                    >+</button>
                  </div>
                </div>
                <Button className="flex-1 py-4 text-lg font-bold flex items-center justify-center gap-2" onClick={handleAddToCart} disabled={addedToCart}>
                  {addedToCart ? (
                    <><Check size={24} /> Adicionado ao Carrinho!</>
                  ) : (
                    <><ShoppingCart size={24} /> Adicionar ao Carrinho</>
                  )}
                </Button>
                <Button variant="outline" className={`py-4 px-6 ${isWishlisted ? "text-red-500 border-red-300" : ""}`} onClick={handleWishlist}>
                  <Heart size={24} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
                </Button>
              </div>
            </Card>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
              <Truck size={24} className="text-blue-600" />
              <div>
                <p className="font-semibold text-sm">Frete Grátis</p>
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
                <p className="font-semibold text-sm">Devolução</p>
                <p className="text-xs text-gray-500">7 dias grátis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Avaliações dos Clientes</h2>
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Star size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhuma avaliação ainda</p>
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
                        {review.user_name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-semibold">{review.user_name || "Usuário"}</p>
                        <div className="flex">{renderStars(review.rating || 5, 14)}</div>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-2">{review.comment || "Ótimo produto!"}</p>
                  </div>
                  <span className="text-sm text-gray-400">{new Date(review.created_at).toLocaleDateString("pt-BR")}</span>
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
`;

fs.writeFileSync(path + '/frontend/src/pages/ProductDetail.tsx', productDetail, 'utf8');
console.log('5. ProductDetail created');

// ===== 6. FRONTEND: COMPLETE Checkout.tsx with PIX =====
const checkoutPage = `import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/store'
import { api } from '@/services/api'
import { CreditCard, Smartphone, Banknote, Check, Copy, X } from 'lucide-react'

export function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [cartData, setCartData] = useState<any>(null)
  const [pixCopied, setPixCopied] = useState(false)
  const [showPixModal, setShowPixModal] = useState(false)
  const [formData, setFormData] = useState({
    shippingAddress: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'credit_card',
  })

  // PIX data
  const pixKey = '62998804480'
  const pixPayload = \`00020101021226800014BR.GOV.BCB.PIX0136\${pixKey}5204000053039865406\${(cartData?.total || 0).toFixed(2).replace('.', '')}5802BR5925E-Commerce Shopping Store6009SAO PAULO62070503***6304\`

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      const res = await api.get('/cart')
      setCartData(res.data)
    } catch (err) {
      console.error('Failed to load cart:', err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey)
    setPixCopied(true)
    setTimeout(() => setPixCopied(false), 3000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.post('/orders', {
        shipping_address: formData.shippingAddress,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        payment_method: formData.paymentMethod,
      })

      localStorage.setItem('lastOrder', JSON.stringify(response.data))
      
      if (formData.paymentMethod === 'pix') {
        setShowPixModal(true)
      } else {
        navigate('/order-confirmation')
      }
    } catch (error) {
      console.error('Failed to create order:', error)
      alert('Erro ao criar pedido. Verifique seus dados e tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePixConfirmed = () => {
    setShowPixModal(false)
    navigate('/order-confirmation')
  }

  const total = cartData?.total || 0
  const shipping = total > 200 ? 0 : 15
  const tax = total * 0.1
  const finalTotal = total + shipping + tax

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>

      {/* Steps */}
      <div className="mb-8 flex gap-3">
        {[
          { num: 1, label: 'Endereço' },
          { num: 2, label: 'Pagamento' },
          { num: 3, label: 'Confirmação' },
        ].map((s) => (
          <div key={s.num} className={\`flex-1 py-3 px-4 rounded-xl text-center font-semibold transition-all \${
            step === s.num
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
              : step > s.num
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-500'
          }\`}>
            {s.label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <>
                  <h2 className="text-2xl font-bold mb-6">Endereço de Entrega</h2>
                  
                  <Input
                    label="Endereço Completo (Rua, Número, Bairro)"
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    required
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Cidade" name="city" value={formData.city} onChange={handleChange} required />
                    <Input label="Estado" name="state" value={formData.state} onChange={handleChange} required />
                    <Input label="CEP" name="zipCode" value={formData.zipCode} onChange={handleChange} required />
                  </div>

                  <Button type="button" onClick={() => setStep(2)} className="w-full py-4 text-lg">
                    Próximo: Pagamento
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="text-2xl font-bold mb-6">Método de Pagamento</h2>
                  
                  <div className="space-y-4">
                    <label className={\`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all hover:bg-blue-50 \${
                      formData.paymentMethod === 'credit_card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }\`}>
                      <input type="radio" name="paymentMethod" value="credit_card"
                        checked={formData.paymentMethod === 'credit_card'} onChange={handleChange} className="w-5 h-5" />
                      <CreditCard size={24} className="ml-4 text-blue-600" />
                      <span className="ml-3 font-semibold text-lg">Cartão de Crédito</span>
                    </label>

                    <label className={\`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all hover:bg-blue-50 \${
                      formData.paymentMethod === 'debit_card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }\`}>
                      <input type="radio" name="paymentMethod" value="debit_card"
                        checked={formData.paymentMethod === 'debit_card'} onChange={handleChange} className="w-5 h-5" />
                      <Banknote size={24} className="ml-4 text-green-600" />
                      <span className="ml-3 font-semibold text-lg">Cartão de Débito</span>
                    </label>

                    <label className={\`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all hover:bg-green-50 \${
                      formData.paymentMethod === 'pix' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }\`}>
                      <input type="radio" name="paymentMethod" value="pix"
                        checked={formData.paymentMethod === 'pix'} onChange={handleChange} className="w-5 h-5" />
                      <Smartphone size={24} className="ml-4 text-green-600" />
                      <div className="ml-3">
                        <span className="font-semibold text-lg">Pix</span>
                        <p className="text-sm text-gray-500">Pagamento instantâneo - ganhe 5% de desconto</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 py-3">
                      Voltar
                    </Button>
                    <Button type="button" onClick={() => setStep(3)} className="flex-1 py-3">
                      Revisar Pedido
                    </Button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="text-2xl font-bold mb-6">Confirmação do Pedido</h2>
                  
                  <div className="bg-gray-50 rounded-xl p-6 space-y-3 mb-6">
                    <h3 className="font-bold text-lg mb-3">📦 Endereço de Entrega</h3>
                    <p><strong>Endereço:</strong> {formData.shippingAddress}</p>
                    <p><strong>Cidade:</strong> {formData.city}</p>
                    <p><strong>Estado:</strong> {formData.state}</p>
                    <p><strong>CEP:</strong> {formData.zipCode}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 space-y-3 mb-6">
                    <h3 className="font-bold text-lg mb-3">💳 Pagamento</h3>
                    <p><strong>Método:</strong> {
                      formData.paymentMethod === 'credit_card' ? 'Cartão de Crédito' :
                      formData.paymentMethod === 'debit_card' ? 'Cartão de Débito' : 'Pix'
                    }</p>
                    {formData.paymentMethod === 'pix' && (
                      <p className="text-green-600 font-semibold">✅ 5% de desconto aplicado!</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1 py-3">
                      Voltar
                    </Button>
                    <Button type="submit" isLoading={isLoading} className="flex-1 py-3 text-lg font-bold">
                      Finalizar Pedido
                    </Button>
                  </div>
                </>
              )}
            </form>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="p-6 sticky top-24">
            <h3 className="font-bold text-lg mb-4">Resumo do Pedido</h3>
            
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frete</span>
                <span className={shipping === 0 ? "text-green-600 font-semibold" : "font-semibold"}>
                  {shipping === 0 ? "Grátis" : \`R$ \${shipping.toFixed(2)}\`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxas (10%)</span>
                <span className="font-semibold">R$ {tax.toFixed(2)}</span>
              </div>
              {formData.paymentMethod === 'pix' && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto Pix (5%)</span>
                  <span className="font-semibold">-R$ {(total * 0.05).toFixed(2)}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-blue-600">
                  R$ {formData.paymentMethod === 'pix' ? (finalTotal * 0.95).toFixed(2) : finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {cartData?.items?.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-3">{cartData.item_count} itens no carrinho</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cartData.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate flex-1">{item.product_name} x{item.quantity}</span>
                      <span className="font-semibold ml-2">R$ {(item.subtotal || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Link to="/cart" className="block text-center text-sm text-blue-600 mt-3 hover:underline">
                  Editar carrinho
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* PIX Modal */}
      {showPixModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center relative animate-fade-in">
            <button onClick={() => setShowPixModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
            
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone size={32} className="text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Pagamento com Pix</h2>
            <p className="text-gray-600 mb-6">
              Escaneie o QR Code abaixo ou copie a chave Pix para pagar
            </p>

            <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-lg">
              <QRCodeSVG value={pixPayload} size={200} level="H" includeMargin={true} />
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Chave Pix (Copia e Cola):</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-3 py-2 rounded-lg text-sm border text-gray-800 truncate font-mono">{pixKey}</code>
                <button onClick={copyPixKey} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Copy size={20} />
                </button>
              </div>
              {pixCopied && (
                <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                  <Check size={16} /> Chave copiada!
                </p>
              )}
            </div>

            <div className="space-y-2 mb-6">
              <p className="text-2xl font-bold text-blue-600">
                R$ {formData.paymentMethod === 'pix' ? (finalTotal * 0.95).toFixed(2) : finalTotal.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">Após o pagamento, clique no botão abaixo</p>
            </div>

            <Button onClick={handlePixConfirmed} className="w-full py-4 text-lg font-bold">
              ✅ Já paguei - Confirmar Pedido
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
`;

fs.writeFileSync(path + '/frontend/src/pages/Checkout.tsx', checkoutPage, 'utf8');
console.log('6. Checkout with PIX created');

// ===== 7. CART PAGE =====
const cartPage = `import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/store'
import { api } from '@/services/api'

export function Cart() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) loadCart()
    else setLoading(false)
  }, [isAuthenticated])

  const loadCart = async () => {
    try {
      const res = await api.get('/cart')
      setItems(res.data.items || [])
    } catch (err) {
      console.error('Failed to load cart:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return
    setUpdatingId(itemId)
    try {
      await api.put('/cart/items/' + itemId, { quantity: newQty })
      await loadCart()
    } catch (err) {
      console.error('Failed to update:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const removeItem = async (itemId: string) => {
    setUpdatingId(itemId)
    try {
      await api.delete('/cart/items/' + itemId)
      setItems(prev => prev.filter(i => i.id !== itemId))
    } catch (err) {
      console.error('Failed to remove:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const clearCart = async () => {
    try {
      await api.delete('/cart')
      setItems([])
    } catch (err) {
      console.error('Failed to clear:', err)
    }
  }

  const total = items.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
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
          <h2 className="text-2xl font-semibold mb-4">Seu carrinho está vazio</h2>
          <p className="text-gray-600 mb-6">Adicione produtos para começar a comprar</p>
          <Link to="/catalog"><Button>Ver Catálogo</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className={\`p-6 \${updatingId === item.id ? 'opacity-50' : ''}\`}>
              <div className="flex items-center gap-6">
                <Link to={"/product/" + item.product_id} className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden">
                    {item.product?.image_url ? (
                      <img src={item.product.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag size={32} />
                      </div>
                    )}
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
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-gray-100">
                      <Minus size={16} />
                    </button>
                    <span className="px-4 font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-gray-100">
                      <Plus size={16} />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
`;

fs.writeFileSync(path + '/frontend/src/pages/Cart.tsx', cartPage, 'utf8');
console.log('7. Cart page created');

// ===== 8. NOT FOUND PAGE =====
const notFoundPage = `import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Página não encontrada</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>
        <Link to="/">
          <Button className="flex items-center gap-2">
            <Home size={20} />
            Voltar ao Início
          </Button>
        </Link>
      </div>
    </div>
  )
}
`;

fs.writeFileSync(path + '/frontend/src/pages/NotFound.tsx', notFoundPage, 'utf8');
console.log('8. NotFound page created');

// ===== 9. ADMIN DASHBOARD =====
const adminPage = `import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { api } from '@/services/api'

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  })
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [prodRes, orderRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/orders?limit=100'),
      ])
      const allProducts = prodRes.data.items || prodRes.data || []
      const allOrders = orderRes.data.items || orderRes.data || []
      
      setProducts(allProducts)
      setOrders(allOrders)
      setStats({
        totalProducts: allProducts.length,
        totalOrders: allOrders.length,
        totalUsers: 0,
        totalRevenue: allOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
      })
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.put('/orders/' + orderId + '/status?status=' + status)
      loadData()
    } catch (err) {
      console.error('Failed to update order:', err)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return
    try {
      await api.delete('/products/' + productId)
      loadData()
    } catch (err) {
      console.error('Failed to delete product:', err)
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
  ]

  if (loading) {
    return <div className="text-center py-24">
      <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
    </div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Painel Administrativo</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={\`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all \${
              activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }\`}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Produtos', value: stats.totalProducts, icon: Package, color: 'blue' },
              { label: 'Pedidos', value: stats.totalOrders, icon: ShoppingCart, color: 'green' },
              { label: 'Usuários', value: stats.totalUsers, icon: Users, color: 'purple' },
              { label: 'Receita', value: 'R$ ' + stats.totalRevenue.toFixed(2), icon: DollarSign, color: 'orange' },
            ].map((stat, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-4">
                  <div className={\`w-12 h-12 bg-\${stat.color}-100 rounded-xl flex items-center justify-center\`}>
                    <stat.icon size={24} className={\`text-\${stat.color}-600\`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Orders */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Pedidos Recentes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-semibold">ID</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Pagamento</th>
                    <th className="pb-3 font-semibold">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order: any) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3 font-mono text-xs">{order.id?.slice(0, 8)}...</td>
                      <td className="py-3 font-semibold">R$ {order.total?.toFixed(2)}</td>
                      <td className="py-3">
                        <span className={\`px-2 py-1 rounded-full text-xs font-semibold \${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }\`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3">{order.payment_method}</td>
                      <td className="py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-500">Nenhum pedido encontrado</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {activeTab === 'products' && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Gerenciar Produtos ({products.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-semibold">Nome</th>
                  <th className="pb-3 font-semibold">Preço</th>
                  <th className="pb-3 font-semibold">Estoque</th>
                  <th className="pb-3 font-semibold">Categoria</th>
                  <th className="pb-3 font-semibold">Destaque</th>
                  <th className="pb-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: any) => (
                  <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-semibold">{product.name}</td>
                    <td className="py-3">R$ {product.price?.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={\`font-semibold \${product.stock > 0 ? 'text-green-600' : 'text-red-600'}\`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3">{product.category}</td>
                    <td className="py-3">
                      {product.is_featured ? '⭐' : '-'}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => deleteProduct(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'orders' && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Gerenciar Pedidos ({orders.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-semibold">ID</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Pagamento</th>
                  <th className="pb-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-mono text-xs">{order.id?.slice(0, 8)}...</td>
                    <td className="py-3 font-semibold">R$ {order.total?.toFixed(2)}</td>
                    <td className="py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="border rounded-lg px-2 py-1 text-sm"
                      >
                        <option value="pending">Pendente</option>
                        <option value="processing">Processando</option>
                        <option value="shipped">Enviado</option>
                        <option value="delivered">Entregue</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                    <td className="py-3">{order.payment_method}</td>
                    <td className="py-3">
                      <span className={\`px-2 py-1 rounded-full text-xs font-semibold \${
                        order.payment_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }\`}>
                        {order.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
`;

fs.writeFileSync(path + '/frontend/src/pages/AdminDashboard.tsx', adminPage, 'utf8');
console.log('9. Admin dashboard created');

// ===== 10. PROFILE PAGE =====
const profilePage = `import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Package, Heart, Settings, LogOut, ShoppingBag, ChevronRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store'
import { api } from '@/services/api'

export function Profile() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [orders, setOrders] = useState<any[]>([])
  const [wishlistCount, setWishlistCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    loadData()
  }, [isAuthenticated])

  const loadData = async () => {
    try {
      const [orderRes, wishRes] = await Promise.all([
        api.get('/orders/my-orders?limit=10'),
        api.get('/wishlist'),
      ])
      setOrders(orderRes.data.items || [])
      setWishlistCount(wishRes.data.count || 0)
    } catch (err) {
      console.error('Failed to load profile data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'orders', label: 'Pedidos', icon: Package },
    { id: 'wishlist', label: 'Favoritos', icon: Heart },
  ]

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
    </div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header */}
      <Card className="p-8 mb-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-white">{user?.full_name?.charAt(0) || 'U'}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{user?.full_name || 'Usuário'}</h1>
        <p className="text-gray-500">{user?.email}</p>
        <p className="text-sm text-gray-400 mt-1">Membro desde {new Date(user?.created_at).toLocaleDateString('pt-BR')}</p>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={\`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all \${
              activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }\`}
          >
            <tab.icon size={20} />
            {tab.label}
            {tab.id === 'orders' && orders.length > 0 && (
              <span className="bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">{orders.length}</span>
            )}
            {tab.id === 'wishlist' && wishlistCount > 0 && (
              <span className="bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">{wishlistCount}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <Card className="p-8">
          <h2 className="text-xl font-bold mb-6">Informações do Perfil</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Nome Completo" value={user?.full_name || ''} disabled />
            <Input label="Email" value={user?.email || ''} disabled />
            <Input label="Telefone" value={user?.phone || 'Não informado'} disabled />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[
              { label: 'Pedidos Realizados', value: user?.total_orders || 0, icon: Package, color: 'blue' },
              { label: 'Total Gasto', value: 'R$ ' + (user?.total_spent || 0).toFixed(2), icon: ShoppingBag, color: 'green' },
              { label: 'Favoritos', value: wishlistCount, icon: Heart, color: 'red' },
            ].map((stat, i) => (
              <Card key={i} className="p-4 text-center">
                <div className={\`w-12 h-12 bg-\${stat.color}-100 rounded-xl flex items-center justify-center mx-auto mb-3\`}>
                  <stat.icon size={24} className={\`text-\${stat.color}-600\`} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </Card>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t">
            <Button variant="outline" className="text-red-500 border-red-200" onClick={handleLogout}>
              <LogOut size={20} className="mr-2" /> Sair da Conta
            </Button>
          </div>
        </Card>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card className="p-12 text-center">
              <Package size={64} className="mx-auto text-gray-200 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum pedido ainda</h3>
              <p className="text-gray-500 mb-6">Você ainda não realizou nenhuma compra</p>
              <Button onClick={() => navigate('/catalog')}>Começar a Comprar</Button>
            </Card>
          ) : (
            orders.map((order: any) => (
              <Card key={order.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 font-mono">Pedido #{order.id?.slice(0, 8)}</p>
                    <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">R$ {order.total?.toFixed(2)}</p>
                    <span className={\`text-xs font-semibold px-2 py-1 rounded-full \${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }\`}>
                      {order.status === 'pending' ? 'Pendente' :
                       order.status === 'processing' ? 'Processando' :
                       order.status === 'shipped' ? 'Enviado' :
                       order.status === 'delivered' ? 'Entregue' : 'Cancelado'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ShoppingBag size={16} />
                  <span>{order.items?.length || 0} itens</span>
                  <span className="mx-2">|</span>
                  <span>{order.payment_method}</span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'wishlist' && (
        <Card className="p-12 text-center">
          <Heart size={64} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Lista de Desejos</h3>
          <p className="text-gray-500 mb-6">Você tem {wishlistCount} itens na sua lista</p>
          <Button onClick={() => navigate('/wishlist')}>Ver Lista Completa</Button>
        </Card>
      )}
    </div>
  )
}
`;

fs.writeFileSync(path + '/frontend/src/pages/Profile.tsx', profilePage, 'utf8');
console.log('10. Profile page created');

// ===== 11. UPDATE App_new.tsx with all routes =====
const appRoutes = `import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header, Footer } from '@/components/layout'
import { Home } from '@/pages/Home'
import { Catalog } from '@/pages/Catalog'
import { ProductDetail } from '@/pages/ProductDetail'
import { Cart } from '@/pages/Cart'
import { Checkout } from '@/pages/Checkout'
import { OrderConfirmation } from '@/pages/OrderConfirmation'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Login/Register'
import { About } from '@/pages/About'
import { Profile } from '@/pages/Profile'
import { Wishlist } from '@/pages/Wishlist'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { NotFound } from '@/pages/NotFound'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/store'
import './styles/animations.css'
import './App.css'

export default function App() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header
          isAuthenticated={isAuthenticated}
          onLogout={() => {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/'
          }}
        />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/about" element={<About />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlist" element={<Wishlist />} />
            {user?.is_admin && <Route path="/admin" element={<AdminDashboard />} />}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
      <Toaster position="top-right" />
    </Router>
  )
}
`;

fs.writeFileSync(path + '/frontend/src/App_new.tsx', appRoutes, 'utf8');
console.log('11. App routes updated');

// ===== 12. UPDATE main.tsx =====
const mainTsx = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App_new'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;

fs.writeFileSync(path + '/frontend/src/main.tsx', mainTsx, 'utf8');
console.log('12. main.tsx updated');

// ===== 13. UPDATE seed_db with image URLs =====
const seedDb = fs.readFileSync(path + '/backend/seed_db.py', 'utf8');
const updatedSeed = seedDb.replace(
  'rating=4.5,\n                review_count=15,',
  'rating=4.5,\n                review_count=15,\n                image_url="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",'
).replace(
  'rating=4.8,\n                review_count=42,',
  'rating=4.8,\n                review_count=42,\n                image_url="https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400",'
).replace(
  'rating=4.3,\n                review_count=28,',
  'rating=4.3,\n                review_count=28,\n                image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",'
).replace(
  'rating=4.6,\n                review_count=34,',
  'rating=4.6,\n                review_count=34,\n                image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",'
).replace(
  'rating=4.2,\n                review_count=18,',
  'rating=4.2,\n                review_count=18,\n                image_url="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400",'
).replace(
  'rating=4.7,\n                review_count=45,',
  'rating=4.7,\n                review_count=45,\n                image_url="https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400",'
);

fs.writeFileSync(path + '/backend/seed_db.py', updatedSeed, 'utf8');
console.log('13. Seed DB updated with image URLs');

console.log('\\n✅ ALL FILES CREATED SUCCESSFULLY!');
console.log('Files created:');
console.log('  - backend/app/api/wishlist.py');
console.log('  - backend/app/api/__init__.py');
console.log('  - frontend/src/pages/Wishlist.tsx');
console.log('  - frontend/src/pages/Home.tsx');
console.log('  - frontend/src/components/product/ProductCard.tsx');
console.log('  - frontend/src/pages/ProductDetail.tsx');
console.log('  - frontend/src/pages/Checkout.tsx');
console.log('  - frontend/src/pages/Cart.tsx');
console.log('  - frontend/src/pages/NotFound.tsx');
console.log('  - frontend/src/pages/AdminDashboard.tsx');
console.log('  - frontend/src/pages/Profile.tsx');
console.log('  - frontend/src/App_new.tsx');
console.log('  - frontend/src/main.tsx');
console.log('  - backend/seed_db.py (updated)');
`;

fs.writeFileSync(path + '/implement.js', content, 'utf8');
console.log('Implement script created');

