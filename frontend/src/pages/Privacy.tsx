import { Link } from 'react-router-dom'
import { LegalPage } from './LegalPage'

export function Privacy() {
  return (
    <LegalPage title="Política de Privacidade" updatedAt="Agosto de 2026">
      <p>
        Esta política descreve como o E-Shop coleta, usa e protege as informações
        fornecidas pelos usuários da plataforma.
      </p>

      <h2>Dados que coletamos</h2>
      <p>
        Nome, email, telefone e endereço de entrega, fornecidos no cadastro e no
        checkout, além do histórico de pedidos e avaliações feitas na plataforma.
      </p>

      <h2>Como usamos seus dados</h2>
      <p>
        Usamos essas informações para processar pedidos, autenticar sua conta,
        enviar atualizações sobre compras e melhorar a experiência de compra.
        Não vendemos seus dados a terceiros.
      </p>

      <h2>Segurança</h2>
      <p>
        Senhas são armazenadas com hash (bcrypt) e a autenticação usa tokens JWT.
        Pagamentos são processados por gateways externos (ex: Mercado Pago) — não
        armazenamos dados completos de cartão em nossos servidores.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode acessar, corrigir ou solicitar a exclusão dos seus dados a
        qualquer momento entrando em contato pela página de{' '}
        <Link to="/contact" className="text-blue-600 hover:underline">Contato</Link>.
      </p>
    </LegalPage>
  )
}
