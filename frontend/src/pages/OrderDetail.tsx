import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, CreditCard, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { orderService } from '@/services/api'
import toast from 'react-hot-toast'

export function OrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!orderId) return
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    setLoading(true)
    try {
      const res = await orderService.getById(orderId as string)
      setOrder(res.data)
    } catch (err) {
      console.error('Failed to load order:', err)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    try {
      await orderService.cancel(orderId as string)
      toast.success('Pedido cancelado')
      loadOrder()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erro ao cancelar pedido')
    }
  }

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
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    )
  }

  if (notFound || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Package size={64} className="mx-auto text-gray-200 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido não encontrado</h1>
        <p className="text-gray-500 mb-6">
          Esse pedido não existe ou não pertence à sua conta.
        </p>
        <Button onClick={() => navigate('/profile')}>Voltar para Meus Pedidos</Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/profile" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6">
        <ArrowLeft size={18} /> Voltar para Meus Pedidos
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedido #{order.id?.slice(0, 8)}</h1>
          <p className="text-sm text-gray-500">
            {order.created_at && new Date(order.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusClasses(order.status)}`}>
          {getStatusLabel(order.status)}
        </span>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <MapPin size={18} /> Endereço de Entrega
        </h2>
        <p className="text-gray-600">{order.shipping_address}</p>
        <p className="text-gray-600">{[order.city, order.state, order.zip_code].filter(Boolean).join(', ')}</p>
        {order.tracking_number && (
          <p className="text-gray-600 mt-2">
            <strong>Rastreio:</strong> <span className="font-mono">{order.tracking_number}</span>
          </p>
        )}
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <CreditCard size={18} /> Pagamento
        </h2>
        <p className="text-gray-600">
          <strong>Método:</strong>{' '}
          {order.payment_method === 'credit_card' ? 'Cartão de Crédito' :
           order.payment_method === 'debit_card' ? 'Cartão de Débito' :
           order.payment_method === 'mercadopago' ? 'Mercado Pago' : 'Pix'}
        </p>
        {order.payment_message && (
          <p className="text-gray-600 mt-1">
            <strong>Status:</strong>{' '}
            <span className={order.payment_approved || order.payment_status === 'completed' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              {order.payment_message}
            </span>
          </p>
        )}
        {order.transaction_id && (
          <p className="text-gray-600 mt-1">
            <strong>Transação:</strong> <span className="font-mono text-sm">{order.transaction_id}</span>
          </p>
        )}
        {order.payment_status === 'failed' && (
          <Link to={`/checkout?retry=${order.id}`}>
            <Button size="sm" className="mt-4">Continuar Pagamento</Button>
          </Link>
        )}
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="font-bold text-lg mb-4">Itens do Pedido</h2>
        <div className="space-y-3">
          {(order.items || []).map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm border-b last:border-0 pb-3 last:pb-0">
              <span>{item.product_name} x{item.quantity}</span>
              <span className="font-semibold">R$ {item.subtotal?.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>R$ {order.subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Frete</span>
            <span>R$ {order.shipping_cost?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Taxas</span>
            <span>R$ {order.tax?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span className="text-blue-600">R$ {order.total?.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {(order.status === 'pending' || order.status === 'processing') && (
        <Button variant="outline" className="text-red-500 border-red-200" onClick={handleCancel}>
          Cancelar Pedido
        </Button>
      )}
    </div>
  )
}
