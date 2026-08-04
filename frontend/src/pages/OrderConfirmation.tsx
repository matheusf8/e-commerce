import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function OrderConfirmation() {
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState<any>(null)

  useEffect(() => {
    const data = localStorage.getItem('lastOrder')
    if (data) {
      setOrderData(JSON.parse(data))
    } else {
      navigate('/catalog')
    }
  }, [navigate])

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Pedido Confirmado!
        </h1>
        <p className="text-gray-600">
          Obrigado por sua compra. Um email de confirmação foi enviado.
        </p>
      </div>

      {orderData && (
        <>
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Número do Pedido</h3>
                <p className="text-lg text-gray-600">#{orderData.tracking_number || orderData.id?.slice(0, 8) || '12345678'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Data</h3>
                <p className="text-lg text-gray-600">{new Date(orderData.created_at || Date.now()).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="font-bold text-lg mb-4">Endereço de Entrega</h2>
            <p className="text-gray-600">{orderData.shipping_address || 'Endereço não informado'}</p>
            <p className="text-gray-600">
              {[orderData.city, orderData.state, orderData.zip_code].filter(Boolean).join(', ') || 'Dados não informados'}
            </p>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="font-bold text-lg mb-4">Pagamento</h2>
            <p className="text-gray-600">
              <strong>Método:</strong>{' '}
              {orderData.payment_method === 'credit_card' ? 'Cartão de Crédito' :
               orderData.payment_method === 'debit_card' ? 'Cartão de Débito' :
               orderData.payment_method === 'pix' ? 'Pix' : orderData.payment_method}
            </p>
            {orderData.payment_message && (
              <p className="text-gray-600 mt-2">
                <strong>Status do Pagamento:</strong>{' '}
                <span className={orderData.payment_approved ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {orderData.payment_message}
                </span>
              </p>
            )}
            <p className="text-gray-600"><strong>Total:</strong> R$ {orderData.total?.toFixed(2) || '0.00'}</p>
          </Card>
        </>
      )}

      <div className="space-y-2">
        <Button className="w-full" onClick={() => navigate('/profile')}>
          Ver Meus Pedidos
        </Button>
        <Button variant="outline" onClick={() => navigate('/catalog')} className="w-full">
          Continuar Comprando
        </Button>
      </div>
    </div>
  )
}

