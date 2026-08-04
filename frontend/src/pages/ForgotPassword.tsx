import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { authService } from '@/services/api'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await authService.forgotPassword(email)
    } catch {
      // ignore — o backend sempre responde com a mesma mensagem genérica,
      // então não há nada de diferente a mostrar mesmo se a chamada falhar
    } finally {
      setIsLoading(false)
      setSent(true)
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Esqueci minha senha</h1>
        <p className="text-gray-600 mb-6">
          Digite seu email e enviaremos um link para redefinir sua senha.
        </p>

        {sent ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-2">
            <Mail size={20} className="mt-0.5 flex-shrink-0" />
            <span>Se esse email estiver cadastrado, você vai receber um link de redefinição em instantes.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" isLoading={isLoading} className="w-full">
              Enviar link de redefinição
            </Button>
          </form>
        )}

        <Link to="/login" className="flex items-center gap-2 text-blue-600 hover:underline mt-6 text-sm">
          <ArrowLeft size={16} /> Voltar para o login
        </Link>
      </div>
    </div>
  )
}
