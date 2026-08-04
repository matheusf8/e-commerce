import { useState, useEffect } from 'react'
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, Plus, Edit, Trash2, X, Eye, EyeOff, Layers, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { api } from '@/services/api'
import toast from 'react-hot-toast'

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalActiveProducts: 0,
  })
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    description: '',
    price: 0,
    original_price: 0,
    stock: 1,
    category: '',
    brand: '',
    is_featured: false,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [prodRes, orderRes, catRes, usersRes] = await Promise.all([
        api.get('/products/admin/all?limit=500'),
        api.get('/orders?limit=100'),
        api.get('/categories?include_inactive=true'),
        api.get('/users/count').catch(() => ({ data: { count: 0 } })),
      ])
      const allProducts = prodRes.data.items || []
      const allOrders = orderRes.data.items || []
      const allCategories = catRes.data || []
      setProducts(allProducts)
      setOrders(allOrders)
      setCategories(allCategories)
      setStats({
        totalProducts: allProducts.length,
        totalOrders: allOrders.length,
        totalUsers: usersRes.data.count || 0,
        totalRevenue: allOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
        totalActiveProducts: allProducts.filter((p: any) => p.is_active !== false).length,
      })
    } catch (err) {
      console.error('Failed to load data:', err)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/products', newProduct)
      toast.success('Produto cadastrado com sucesso!')
      setShowAddForm(false)
      setNewProduct({ name: '', sku: '', description: '', price: 0, original_price: 0, stock: 1, category: '', brand: '', is_featured: false })
      loadData()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erro ao cadastrar produto')
    }
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return
    try {
      await api.put('/products/' + editingProduct.id, editingProduct)
      toast.success('Produto atualizado!')
      setEditingProduct(null)
      loadData()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erro ao atualizar produto')
    }
  }

  const toggleProductActive = async (productId: string, currentStatus: boolean) => {
    try {
      await api.put('/products/' + productId, { is_active: !currentStatus })
      toast.success(currentStatus ? 'Produto desativado' : 'Produto ativado')
      loadData()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erro ao alterar status')
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.put('/orders/' + orderId + '/status', { status: newStatus })
      toast.success('Status atualizado para ' + newStatus + '!')
      loadData()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erro ao atualizar status')
    }
  }

  const viewOrderDetail = async (orderId: string) => {
    try {
      const res = await api.get('/orders/' + orderId)
      setSelectedOrder(res.data)
    } catch (err: any) {
      toast.error('Erro ao carregar detalhes do pedido')
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return
    try {
      await api.delete('/products/' + productId)
      toast.success('Produto excluido com sucesso!')
      loadData()
    } catch (err: any) {}
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/categories', newCategory)
      toast.success('Categoria criada!')
      setShowCategoryForm(false)
      setNewCategory({ name: '', description: '' })
      loadData()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erro ao criar categoria')
    }
  }

  const toggleCategoryActive = async (catId: string, currentStatus: boolean) => {
    try {
      await api.put('/categories/' + catId, { is_active: !currentStatus })
      toast.success('Categoria atualizada')
      loadData()
    } catch (err: any) {}
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'shipped': return 'bg-blue-100 text-blue-700'
      default: return 'bg-yellow-100 text-yellow-700'
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'categories', label: 'Categorias', icon: Layers },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
  ]

  const statCards = [
    { label: 'Produtos', value: stats.totalProducts, sub: stats.totalActiveProducts + ' ativos', icon: Package, bg: 'bg-blue-100', text: 'text-blue-600' },
    { label: 'Pedidos', value: stats.totalOrders, icon: ShoppingCart, bg: 'bg-green-100', text: 'text-green-600' },
    { label: 'Usuarios', value: stats.totalUsers, icon: Users, bg: 'bg-purple-100', text: 'text-purple-600' },
    { label: 'Receita', value: 'R$ ' + stats.totalRevenue.toFixed(2), icon: DollarSign, bg: 'bg-orange-100', text: 'text-orange-600' },
  ]

  if (loading) {
    return (
      <div className="text-center py-24">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
      </div>
    )
  }

  const renderOrderRow = (order: any, showActions: boolean) => (
    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
      <td className="py-3">
        <span className="font-medium">{order.customer?.name || 'N/A'}</span>
        <span className="block text-xs text-gray-500">{order.customer?.email || ''}</span>
      </td>
      <td className="py-3 text-xs">
        <MapPin size={12} className="inline mr-1 text-gray-400" />
        {order.shipping_address || 'N/A'}, {order.city || ''}-{order.state || ''}
      </td>
      <td className="py-3 font-semibold">R$ {order.total?.toFixed(2)}</td>
      <td className="py-3">
        <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)}
          className="border rounded-lg px-2 py-1 text-sm font-medium"
          style={{ backgroundColor: order.status === 'delivered' ? '#dcfce7' : order.status === 'cancelled' ? '#fee2e2' : order.status === 'shipped' ? '#dbeafe' : order.status === 'processing' ? '#fef9c3' : '#f3f4f6' }}>
          <option value="pending">Pendente</option>
          <option value="processing">Processando</option>
          <option value="shipped">Enviado</option>
          <option value="delivered">Entregue</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </td>
      <td className="py-3">
        <span className={'px-2 py-1 rounded-full text-xs font-semibold ' + (order.payment_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
          {order.payment_status}
        </span>
      </td>
      <td className="py-3 text-xs">
        {order.payment_method === 'credit_card' ? 'Cartão Crédito' :
         order.payment_method === 'debit_card' ? 'Cartão Débito' :
         order.payment_method === 'mercadopago' ? 'Mercado Pago' :
         order.payment_method === 'pix' ? 'Pix' : (order.payment_method || 'N/A')}
      </td>
      <td className="py-3 text-xs text-gray-500">
        {order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : '-'}
      </td>
      {showActions && (
        <td className="py-3">
          <button onClick={() => viewOrderDetail(order.id)} className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium">Detalhes</button>
        </td>
      )}
    </tr>
  )

  const renderOrderDetailModal = () => {
    if (!selectedOrder) return null
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Detalhes do Pedido</h3>
            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">ID do Pedido</p>
              <p className="font-mono text-sm font-medium">{selectedOrder.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <span className={'px-2 py-1 rounded-full text-xs font-semibold ' + getStatusColor(selectedOrder.status)}>{selectedOrder.status}</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Cliente</p>
              <p className="font-medium">{selectedOrder.customer?.name || 'N/A'}</p>
              <p className="text-sm text-gray-500">{selectedOrder.customer?.email || ''}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <p className="text-xl font-bold text-green-600">R$ {selectedOrder.total?.toFixed(2)}</p>
            </div>
          </div>
          <div className="border-t pt-4 mb-6">
            <h4 className="font-semibold mb-3"><MapPin size={16} className="inline mr-1" /> Endereco de Entrega</h4>
            <p className="text-sm">{selectedOrder.shipping_address}</p>
            <p className="text-sm">{selectedOrder.city} - {selectedOrder.state}</p>
            <p className="text-sm">CEP: {selectedOrder.zip_code}</p>
          </div>
          <div className="border-t pt-4 mb-6">
            <h4 className="font-semibold mb-3">Pagamento</h4>
            <p className="text-sm">Metodo: <span className="font-medium">{selectedOrder.payment_method}</span></p>
            <p className="text-sm">Status: <span className={'ml-1 font-medium ' + (selectedOrder.payment_status === 'completed' ? 'text-green-600' : 'text-yellow-600')}>{selectedOrder.payment_status}</span></p>
            {selectedOrder.transaction_id && <p className="text-sm">Transacao: <span className="font-mono text-xs">{selectedOrder.transaction_id}</span></p>}
            {selectedOrder.tracking_number && <p className="text-sm">Rastreio: <span className="font-mono text-xs">{selectedOrder.tracking_number}</span></p>}
          </div>
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Itens do Pedido</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-semibold">Produto</th>
                  <th className="pb-2 font-semibold">Qtd</th>
                  <th className="pb-2 font-semibold">Preco</th>
                  <th className="pb-2 font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(selectedOrder.items || []).map((item: any) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-2">{item.product_name}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">R$ {item.price?.toFixed(2)}</td>
                    <td className="py-2 font-medium">R$ {item.subtotal?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan={3} className="pt-2 text-right font-semibold">Subtotal:</td><td className="pt-2 font-semibold">R$ {selectedOrder.subtotal?.toFixed(2)}</td></tr>
                <tr><td colSpan={3} className="text-right text-sm text-gray-500">Frete:</td><td className="text-sm">R$ {selectedOrder.shipping_cost?.toFixed(2)}</td></tr>
                <tr><td colSpan={3} className="text-right font-bold text-base">Total:</td><td className="font-bold text-base">R$ {selectedOrder.total?.toFixed(2)}</td></tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={'w-12 h-12 ' + stat.bg + ' rounded-xl flex items-center justify-center'}>
                      <stat.icon size={24} className={stat.text} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.sub && <p className="text-xs text-gray-500">{stat.sub}</p>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Pedidos Recentes</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-semibold">Cliente</th>
                      <th className="pb-3 font-semibold">Endereco</th>
                      <th className="pb-3 font-semibold">Total</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Pagamento</th>
                      <th className="pb-3 font-semibold">Metodo</th>
                      <th className="pb-3 font-semibold">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => renderOrderRow(order, false))}
                    {orders.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-gray-500">Nenhum pedido encontrado</td></tr>}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )
      case 'products':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Produtos ({stats.totalActiveProducts} ativos)</h2>
              <Button onClick={() => setShowAddForm(true)}><Plus size={20} /> Novo Produto</Button>
            </div>
            {showAddForm && (
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">Cadastrar Produto</h3>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Nome" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} required />
                  <Input label="SKU" value={newProduct.sku} onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})} required />
                  <Input label="Preco" type="number" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})} required />
                  <Input label="Estoque" type="number" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})} required />
                  <Input label="Categoria" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} required />
                  <div className="md:col-span-2 flex gap-2">
                    <Button type="submit">Salvar</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancelar</Button>
                  </div>
                </form>
              </Card>
            )}
            {editingProduct && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Editar Produto</h3>
                    <button onClick={() => setEditingProduct(null)}><X size={24} /></button>
                  </div>
                  <form onSubmit={handleEditProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Nome" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} required />
                    <Input label="Preco" type="number" step="0.01" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})} required />
                    <Input label="Estoque" type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})} required />
                    <Input label="Categoria" value={editingProduct.category} onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})} required />
                    <div className="md:col-span-2 flex gap-2">
                      <Button type="submit">Salvar</Button>
                      <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>Cancelar</Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}
            <Card className="p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-semibold">Nome</th>
                    <th className="pb-3 font-semibold">Preco</th>
                    <th className="pb-3 font-semibold">Estoque</th>
                    <th className="pb-3 font-semibold">Categoria</th>
                    <th className="pb-3 font-semibold">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any) => (
                    <tr key={product.id} className={'border-b last:border-0 hover:bg-gray-50 ' + (product.is_active === false ? 'opacity-60' : '')}>
                      <td className="py-3 font-semibold">{product.name}</td>
                      <td className="py-3">R$ {product.price?.toFixed(2)}</td>
                      <td className="py-3"><span className={'font-semibold ' + ((product.stock || 0) > 0 ? 'text-green-600' : 'text-red-600')}>{product.stock || 0}</span></td>
                      <td className="py-3">{product.category}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button onClick={() => toggleProductActive(product.id, product.is_active !== false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Ativar/Desativar">
                            {product.is_active !== false ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button onClick={() => setEditingProduct({...product})} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                          <button onClick={() => deleteProduct(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )
      case 'categories':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Categorias ({categories.length})</h2>
              <Button onClick={() => setShowCategoryForm(true)}><Plus size={20} /> Nova</Button>
            </div>
            {showCategoryForm && (
              <Card className="p-6 mb-6">
                <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Nome" value={newCategory.name} onChange={(e) => setNewCategory({...newCategory, name: e.target.value})} required />
                  <div className="flex gap-2">
                    <Button type="submit">Criar</Button>
                    <Button type="button" variant="outline" onClick={() => setShowCategoryForm(false)}>Cancelar</Button>
                  </div>
                </form>
              </Card>
            )}
            <Card className="p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-semibold">Nome</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat: any) => (
                    <tr key={cat.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-semibold">{cat.name}</td>
                      <td className="py-3">
                        <span className={'px-2 py-1 rounded-full text-xs font-semibold ' + (cat.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                          {cat.is_active !== false ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td className="py-3">
                        <button onClick={() => toggleCategoryActive(cat.id, cat.is_active !== false)} className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50">
                          {cat.is_active !== false ? 'Desativar' : 'Ativar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )
      case 'orders':
        return (
          <>
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold mb-6">Pedidos ({orders.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-semibold">Cliente</th>
                      <th className="pb-3 font-semibold">Endereco</th>
                      <th className="pb-3 font-semibold">Total</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Pagamento</th>
                      <th className="pb-3 font-semibold">Metodo</th>
                      <th className="pb-3 font-semibold">Data</th>
                      <th className="pb-3 font-semibold">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => renderOrderRow(order, true))}
                    {orders.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-gray-500">Nenhum pedido</td></tr>}
                  </tbody>
                </table>
              </div>
            </Card>
            {renderOrderDetailModal()}
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Painel Administrativo</h1>
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={'flex items-center gap-2 px-6 py-3 rounded-xl font-semibold ' + (activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}>
            <tab.icon size={20} /> {tab.label}
          </button>
        ))}
      </div>
      {renderTabContent()}
    </div>
  )
}
