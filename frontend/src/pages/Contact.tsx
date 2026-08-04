import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    // Sem endpoint de contato no backend ainda — simula o envio para manter
    // a UX completa. Trocar por uma chamada real (ex: POST /api/contact) quando existir.
    setTimeout(() => {
      toast.success('Mensagem enviada! Retornaremos em breve.')
      setForm({ name: '', email: '', message: '' })
      setSending(false)
    }, 600)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Fale Conosco</h1>
        <p className="text-gray-600">Dúvidas, sugestões ou problemas com seu pedido? Manda pra gente.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-6 md:col-span-1 space-y-6 h-fit">
          <div className="flex items-start gap-3">
            <Mail size={20} className="text-blue-600 mt-1" />
            <div>
              <p className="font-semibold text-gray-900">Email</p>
              <p className="text-gray-600 text-sm">info@eshop.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone size={20} className="text-blue-600 mt-1" />
            <div>
              <p className="font-semibold text-gray-900">Telefone</p>
              <p className="text-gray-600 text-sm">(11) 9999-9999</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-blue-600 mt-1" />
            <div>
              <p className="font-semibold text-gray-900">Endereço</p>
              <p className="text-gray-600 text-sm">São Paulo, SP</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>
            <Button type="submit" isLoading={sending} className="flex items-center gap-2">
              <Send size={18} /> Enviar Mensagem
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
