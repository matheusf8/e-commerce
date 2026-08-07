import { Menu, X, ShoppingCart, User, LogOut, Zap, Heart, Shield } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store'
import { siteConfig } from '@/config/site'

interface HeaderProps {
  cartItemCount?: number
  isAuthenticated?: boolean
  isAdmin?: boolean
  onLogout?: () => void
}

export function Header({ cartItemCount = 0, isAuthenticated = false, isAdmin = false, onLogout }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const storeItemCount = useCartStore(state => state.itemCount)
  const itemCount = isAuthenticated ? storeItemCount : cartItemCount

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/'
    }
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Zap className="text-blue-600" size={28} />
            <span className="font-bold text-xl text-gray-900">{siteConfig.name}</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex gap-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition font-medium">
              Inicio
            </Link>
            <Link to="/catalog" className="text-gray-700 hover:text-blue-600 transition font-medium">
              Catalogo
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 transition font-medium">
              Sobre
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Wishlist */}
            {isAuthenticated && (
              <Link to="/wishlist" className="relative p-2 text-gray-700 hover:text-red-500 transition">
                <Heart size={22} />
              </Link>
            )}

            {/* Admin */}
            {isAdmin && (
              <Link to="/admin" className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-200 transition">
                <Shield size={16} />
                Admin
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-blue-600 transition">
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/profile">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User size={18} />
                    <span className="hidden lg:inline">Perfil</span>
                  </Button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-700 hover:text-red-600 transition"
                  title="Sair"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">Entrar</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Registrar</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              Inicio
            </Link>
            <Link to="/catalog" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              Catalogo
            </Link>
            <Link to="/about" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              Sobre
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/wishlist" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Favoritos
                </Link>
                <Link to="/profile" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Perfil
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className="block px-3 py-2 text-purple-700 hover:bg-purple-50 rounded-lg font-semibold">
                Painel Admin
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}

