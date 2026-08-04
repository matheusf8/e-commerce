import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useCartStore } from '@/store'
import { api } from '@/services/api'
import { CreditCard as CreditCardIcon, Smartphone, Banknote, Check, Copy, X, AlertTriangle, RefreshCw } from 'lucide-react'

const STORAGE_KEY = 'checkout_form_data'

interface CheckoutFormData {
  shippingAddress: string
  city: string
  state: string
  zipCode: string
  paymentMethod: string
  cardNumber: string
  cardName: string
  cardExpiry: string
  cardCvv: string
}

export function Checkout() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const retryOrderId = searchParams.get('retry')
  const { items, total, itemCount, fetchCart } = useCartStore()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [cartData, setCartData] = useState<any>(null)
  const [pixCopied, setPixCopied] = useState(false)
  const [showPixModal, setShowPixModal] = useState(false)
  const [paymentResult, setPaymentResult] = useState<any>(null) // {approved: boolean, message: string}
  const [isRetrying, setIsRetrying] = useState(false)

  const [formData, setFormData] = useState<CheckoutFormData>(() => {
    // Load saved form data from localStorage
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved) as CheckoutFormData
      } catch {
        // ignore
      }
    }
    return {
      shippingAddress: '',
      city: '',
      state: '',
      zipCode: '',
      paymentMethod: 'credit_card',
      // Card fields
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCvv: '',
    }
  })

  const pixKey = 'a1b2c3d4-e5f6-7890-1234-567890abcdef'

  useEffect(() => {
    fetchCart()
    loadCart()
    
    // If retrying payment, load order data
    if (retryOrderId) {
      loadRetryOrder()
    }
  }, [retryOrderId])

  // Save form data on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
  }, [formData])

  const loadRetryOrder = async () => {
    try {
      const res = await api.get(`/orders/${retryOrderId}`)
      const order = res.data
      setFormData({
        shippingAddress: order.shipping_address || '',
        city: order.city || '',
        state: order.state || '',
        zipCode: order.zip_code || '',
        paymentMethod: order.payment_method || 'credit_card',
        cardNumber: '',
        cardName: '',
        cardExpiry: '',
        cardCvv: '',
      })
      setStep(2) // Go to payment step
      setIsRetrying(true)
    } catch (err) {
      console.error('Failed to load order for retry:', err)
    }
  }

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
    
    // Format card number: add space every 4 digits
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\D/g, '').slice(0, 16)
      const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
      setFormData(prev => ({ ...prev, [name]: formatted }))
      return
    }
    
    // Format expiry: add slash after 2 digits
    if (name === 'cardExpiry') {
      const cleaned = value.replace(/\D/g, '').slice(0, 4)
      if (cleaned.length > 2) {
        setFormData(prev => ({ ...prev, [name]: cleaned.slice(0, 2) + '/' + cleaned.slice(2) }))
      } else {
        setFormData(prev => ({ ...prev, [name]: cleaned }))
      }
      return
    }
    
    // Format CVV: max 4 digits
    if (name === 'cardCvv') {
      const cleaned = value.replace(/\D/g, '').slice(0, 4)
      setFormData(prev => ({ ...prev, [name]: cleaned }))
      return
    }

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
    setPaymentResult(null)
    try {
      const payload: any = {
        shipping_address: formData.shippingAddress,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        payment_method: formData.paymentMethod,
      }

      // Add card data if credit/debit card
      if (formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'debit_card') {
        payload.card_number = formData.cardNumber.replace(/\s/g, '')
        payload.card_name = formData.cardName
        payload.card_expiry = formData.cardExpiry
        payload.card_cvv = formData.cardCvv
      }

      const response = await api.post('/orders', payload)
      const orderData = response.data
      
      localStorage.setItem('lastOrder', JSON.stringify(orderData))
      
      // Clear saved checkout form after successful order
      localStorage.removeItem(STORAGE_KEY)
      
      // Save the order for retry purposes
      if (orderData.pending_orders) {
        localStorage.setItem('pendingOrders', JSON.stringify(orderData.pending_orders))
      }

      // Handle payment result
      if (orderData.payment_approved) {
        if (formData.paymentMethod === 'pix') {
          setShowPixModal(true)
        } else {
          navigate('/order-confirmation')
        }
      } else {
        // Payment failed - show result in the UI
        setPaymentResult({
          approved: false,
          message: orderData.payment_message || 'Pagamento recusado. Tente novamente.',
          orderId: orderData.id
        })
      }
    } catch (error: any) {
      console.error('Failed to create order:', error)
      setPaymentResult({
        approved: false,
        message: error.response?.data?.detail || 'Erro ao criar pedido. Verifique seus dados e tente novamente.',
        orderId: null
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetryPayment = async () => {
    if (!paymentResult?.orderId) return
    setIsLoading(true)
    try {
      const res = await api.post(`/orders/${paymentResult.orderId}/retry-payment`)
      const data = res.data
      
      if (data.payment_approved) {
        localStorage.setItem('lastOrder', JSON.stringify(data))
        setPaymentResult(null)
        navigate('/order-confirmation')
      } else {
        setPaymentResult({
          approved: false,
          message: data.payment_message || 'Pagamento recusado novamente. Tente outro método.',
          orderId: paymentResult.orderId
        })
      }
    } catch (err: any) {
      setPaymentResult({
        approved: false,
        message: err.response?.data?.detail || 'Erro ao processar pagamento',
        orderId: paymentResult.orderId
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePixConfirmed = () => {
    setShowPixModal(false)
    navigate('/order-confirmation')
  }

  const displayTotal = cartData?.total || total || 0
  const shipping = displayTotal > 200 ? 0 : 15
  const tax = displayTotal * 0.1
  const pixDiscount = displayTotal * 0.05
  const finalTotal = displayTotal + shipping + tax
  const pixTotal = formData.paymentMethod === 'pix' ? finalTotal - pixDiscount : finalTotal

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>

      {/* Steps */}
      <div className="mb-8 flex gap-3">
        {[
          { num: 1, label: 'Endereco' },
          { num: 2, label: 'Pagamento' },
          { num: 3, label: 'Confirmacao' },
        ].map((s) => (
          <div key={s.num}
            className={"flex-1 py-3 px-4 rounded-xl text-center font-semibold transition-all " +
              (step === s.num ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' :
               step > s.num ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500')}
          >
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
                  <h2 className="text-2xl font-bold mb-6">Endereco de Entrega</h2>
                  <Input label="Endereco Completo (Rua, Numero, Bairro)"
                    name="shippingAddress" value={formData.shippingAddress}
                    onChange={handleChange} required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Cidade" name="city" value={formData.city} onChange={handleChange} required />
                    <Input label="Estado" name="state" value={formData.state} onChange={handleChange} required />
                    <Input label="CEP" name="zipCode" value={formData.zipCode} onChange={handleChange} required />
                  </div>
                  <Button type="button" onClick={() => setStep(2)} className="w-full py-4 text-lg">
                    Proximo: Pagamento
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="text-2xl font-bold mb-6">Metodo de Pagamento</h2>
                  <div className="space-y-4">
                    <label className={"flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all hover:bg-blue-50 " +
                      (formData.paymentMethod === 'credit_card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200')}>
                      <input type="radio" name="paymentMethod" value="credit_card"
                        checked={formData.paymentMethod === 'credit_card'} onChange={handleChange} className="w-5 h-5" />
                      <CreditCardIcon size={24} className="ml-4 text-blue-600" />
                      <span className="ml-3 font-semibold text-lg">Cartao de Credito</span>
                    </label>
                    <label className={"flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all hover:bg-blue-50 " +
                      (formData.paymentMethod === 'debit_card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200')}>
                      <input type="radio" name="paymentMethod" value="debit_card"
                        checked={formData.paymentMethod === 'debit_card'} onChange={handleChange} className="w-5 h-5" />
                      <Banknote size={24} className="ml-4 text-green-600" />
                      <span className="ml-3 font-semibold text-lg">Cartao de Debito</span>
                    </label>
                    <label className={"flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all hover:bg-green-50 " +
                      (formData.paymentMethod === 'pix' ? 'border-green-500 bg-green-50' : 'border-gray-200')}>
                      <input type="radio" name="paymentMethod" value="pix"
                        checked={formData.paymentMethod === 'pix'} onChange={handleChange} className="w-5 h-5" />
                      <Smartphone size={24} className="ml-4 text-green-600" />
                      <div className="ml-3">
                        <span className="font-semibold text-lg">Pix</span>
                        <p className="text-sm text-gray-500">Pagamento instantaneo - ganhe 5% de desconto</p>
                      </div>
                    </label>

                    {/* Credit/Debit Card Form */}
                    {(formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'debit_card') && (
                      <div className="mt-6 p-6 bg-gray-50 rounded-xl border-2 border-blue-100 space-y-4 animate-fade-in">
                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                          <CreditCardIcon size={20} className="text-blue-600" />
                          Dados do {formData.paymentMethod === 'credit_card' ? 'Cartão de Crédito' : 'Cartão de Débito'}
                        </h3>

                        <Input
                          label="Nome no Cartão"
                          name="cardName"
                          placeholder="Nome como está no cartão"
                          value={formData.cardName}
                          onChange={handleChange}
                          required
                        />

                        <Input
                          label="Número do Cartão"
                          name="cardNumber"
                          placeholder="0000 0000 0000 0000"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          required
                          maxLength={19}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Validade (MM/AA)"
                            name="cardExpiry"
                            placeholder="MM/AA"
                            value={formData.cardExpiry}
                            onChange={handleChange}
                            required
                            maxLength={5}
                          />
                          <Input
                            label="CVV"
                            name="cardCvv"
                            placeholder="000"
                            value={formData.cardCvv}
                            onChange={handleChange}
                            required
                            maxLength={4}
                            type="password"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 mt-8">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 py-3">Voltar</Button>
                    <Button type="button" onClick={() => setStep(3)} className="flex-1 py-3">Revisar Pedido</Button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="text-2xl font-bold mb-6">Confirmacao do Pedido</h2>

                  {/* Payment Result */}
                  {paymentResult && !paymentResult.approved && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle size={28} className="text-red-500" />
                        <h3 className="text-lg font-bold text-red-700">Pagamento Recusado</h3>
                      </div>
                      <p className="text-red-600 mb-4">{paymentResult.message}</p>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="danger"
                          onClick={handleRetryPayment}
                          isLoading={isLoading}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw size={18} />
                          Tentar Pagar Novamente
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(2)}
                        >
                          Alterar Metodo
                        </Button>
                      </div>
                    </div>
                  )}

                  {isRetrying && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                      <p className="text-blue-700 font-semibold">
                        Voce esta retomando um pagamento pendente
                      </p>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-xl p-6 space-y-3 mb-6">
                    <h3 className="font-bold text-lg mb-3">Endereco de Entrega</h3>
                    <p><strong>Endereco:</strong> {formData.shippingAddress}</p>
                    <p><strong>Cidade:</strong> {formData.city}</p>
                    <p><strong>Estado:</strong> {formData.state}</p>
                    <p><strong>CEP:</strong> {formData.zipCode}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6 space-y-3 mb-6">
                    <h3 className="font-bold text-lg mb-3">Pagamento</h3>
                    <p><strong>Metodo:</strong> {
                      formData.paymentMethod === 'credit_card' ? 'Cartao de Credito' :
                      formData.paymentMethod === 'debit_card' ? 'Cartao de Debito' : 'Pix'
                    }</p>
                    {(formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'debit_card') && (
                      <>
                        <p><strong>Cartão:</strong> **** **** **** {formData.cardNumber.replace(/\s/g, '').slice(-4)}</p>
                        <p><strong>Titular:</strong> {formData.cardName}</p>
                      </>
                    )}
                    {formData.paymentMethod === 'pix' && (
                      <p className="text-green-600 font-semibold">5% de desconto aplicado!</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1 py-3">Voltar</Button>
                    <Button type="submit" isLoading={isLoading} className="flex-1 py-3 text-lg font-bold">Finalizar Pedido</Button>
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
                <span className="font-semibold">R$ {displayTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frete</span>
                <span className={shipping === 0 ? "text-green-600 font-semibold" : "font-semibold"}>
                  {shipping === 0 ? "Gratis" : "R$ " + shipping.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxas (10%)</span>
                <span className="font-semibold">R$ {tax.toFixed(2)}</span>
              </div>
              {formData.paymentMethod === 'pix' && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto Pix (5%)</span>
                  <span className="font-semibold">-R$ {pixDiscount.toFixed(2)}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-blue-600">R$ {pixTotal.toFixed(2)}</span>
              </div>
            </div>

            {(cartData?.items?.length > 0 || items.length > 0) && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-3">{itemCount} itens no carrinho</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(cartData?.items || items).map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate flex-1">{item.product_name} x{item.quantity}</span>
                      <span className="font-semibold ml-2">R$ {(item.subtotal || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Link to="/cart" className="block text-center text-sm text-blue-600 mt-3 hover:underline">Editar carrinho</Link>
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
            <p className="text-gray-600 mb-6">Escaneie o QR Code abaixo ou copie a chave Pix para pagar</p>

            <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-lg">
              <QRCodeSVG value={pixKey} size={200} level="H" includeMargin={true} />
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
              <p className="text-2xl font-bold text-blue-600">R$ {pixTotal.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Apos o pagamento, clique no botao abaixo</p>
            </div>

            <Button onClick={handlePixConfirmed} className="w-full py-4 text-lg font-bold">
              Ja paguei - Confirmar Pedido
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}

