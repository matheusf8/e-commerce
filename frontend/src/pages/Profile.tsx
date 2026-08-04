import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Package, Heart, Settings, LogOut, ShoppingBag, ChevronRight, Star, Edit2, Save, X, Eye, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store'
import { api } from '@/services/api'
import toast from 'react-hot-toast'

export function Profile() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, setUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [orders, setOrders] = useState<any[]>([])
  const [wishlistCount, setWishlistCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    loadData()
  }, [isAuthenticated])

  useEffect(() => {
    if (user) {
      setEditForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zip_code: user.zip_code || '',
      })
    }
  }, [user])

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

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await api.put('/auth/me', {
        full_name: editForm.full_name,
        phone: editForm.phone || null,
        address: editForm.address || null,
        city: editForm.city || null,
        state: editForm.state || null,
        zip_code: editForm.zip_code || null,
      })
      setUser(res.data)
      setEditing(false)
      toast.success('Perfil atualizado com sucesso!')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('As senhas não conferem')
      return
    }
    if (passwordForm.new_password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres')
      return
    }
    setSaving(true)
    try {
      await api.put('/auth/me/password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      })
      setShowPasswordModal(false)
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
      toast.success('Senha alterada com sucesso!')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erro ao alterar senha')
    } finally {
      setSaving(false)
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

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'shipped': return 'bg-blue-100 text-blue-700'
      case 'processing': return 'bg-purple-100 text-purple-700'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-700'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      processing: 'Processando',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    }
    return labels[status] || status
  }

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
        <h1 className="text-2xl font-bold text-gray-900">{user?.full_name || 'Usuario'}</h1>
        <p className="text-gray-500">{user?.email}</p>
        <p className="text-sm text-gray-400 mt-1">
          Membro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
        </p>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={"flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all " +
              (activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Informacoes do Perfil</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
                <Lock size={16} className="mr-1" /> Alterar Senha
              </Button>
              {!editing ? (
                <Button size="sm" onClick={() => setEditing(true)}>
                  <Edit2 size={16} className="mr-1" /> Editar
                </Button>
              ) : (
                <>
                  <Button size="sm" onClick={handleSaveProfile} isLoading={saving}>
                    <Save size={16} className="mr-1" /> Salvar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                    <X size={16} /> Cancelar
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nome Completo"
              value={editForm.full_name}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              disabled={!editing}
            />
            <Input label="Email" value={user?.email || ''} disabled />
            <Input
              label="Telefone"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              disabled={!editing}
            />
            <Input
              label="Endereco"
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              disabled={!editing}
            />
            <Input
              label="Cidade"
              value={editForm.city}
              onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
              disabled={!editing}
            />
            <Input
              label="Estado"
              value={editForm.state}
              onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
              disabled={!editing}
            />
            <Input
              label="CEP"
              value={editForm.zip_code}
              onChange={(e) => setEditForm({ ...editForm, zip_code: e.target.value })}
              disabled={!editing}
            />
          </div>

          <div className="mt-8 pt-6 border-t flex gap-3">
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
              <p className="text-gray-500 mb-6">Voce ainda nao realizou nenhuma compra</p>
              <Button onClick={() => navigate('/catalog')}>Comecar a Comprar</Button>
            </Card>
          ) : (
            orders.map((order: any) => (
              <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 font-mono">Pedido #{order.id?.slice(0, 8)}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">R$ {order.total?.toFixed(2)}</p>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusClasses(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ShoppingBag size={16} />
                    <span>{order.items?.length || 0} itens</span>
                    <span className="mx-2">|</span>
                    <span>{order.payment_method === 'credit_card' ? 'Cartao Credito' :
                           order.payment_method === 'debit_card' ? 'Cartao Debito' : 'Pix'}</span>
                    {order.payment_status === 'failed' && (
                      <>
                        <span className="mx-2">|</span>
                        <span className="text-red-500 font-semibold">Pagamento Pendente</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link to={"/order/" + order.id}>
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Eye size={14} /> Detalhes
                      </Button>
                    </Link>
                    {order.payment_status === 'failed' && (
                      <Link to={"/checkout?retry=" + order.id}>
                        <Button size="sm" variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-50">
                          Continuar Pagamento
                        </Button>
                      </Link>
                    )}
                    {(order.status === 'pending' || order.status === 'processing') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 border-red-200"
                        onClick={async () => {
                          try {
                            await api.post('/orders/' + order.id + '/cancel')
                            toast.success('Pedido cancelado')
                            loadData()
                          } catch (err: any) {
                            toast.error(err.response?.data?.detail || 'Erro ao cancelar')
                          }
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="text-center py-12">
          <Heart size={64} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Lista de Desejos</h3>
          <p className="text-gray-500 mb-6">Voce tem {wishlistCount} itens na sua lista</p>
          <Button onClick={() => navigate('/wishlist')}>Ver Lista Completa</Button>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Alterar Senha</h2>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <Input
                label="Senha Atual"
                type="password"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              />
              <Input
                label="Nova Senha"
                type="password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              />
              <Input
                label="Confirmar Nova Senha"
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
              />
              <Button className="w-full" onClick={handleChangePassword} isLoading={saving}>
                Alterar Senha
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
