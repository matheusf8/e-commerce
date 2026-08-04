import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/'
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header
          isAuthenticated={isAuthenticated}
          isAdmin={user?.is_admin || false}
          onLogout={handleLogout}
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
            <Route path="/admin" element={
              isAuthenticated && user?.is_admin ? <AdminDashboard /> : <NotFound />
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
      <Toaster position="top-right" />
    </Router>
  )
}

