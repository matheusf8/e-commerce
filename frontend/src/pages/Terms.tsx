import { LegalPage } from './LegalPage'
import { siteConfig } from '@/config/site'

export function Terms() {
  return (
    <LegalPage title="Termos de Uso" updatedAt="Agosto de 2026">
      <p>
        Ao criar uma conta e realizar compras {siteConfig.legalName ? `com ${siteConfig.legalName} (${siteConfig.name})` : `no ${siteConfig.name}`}, você concorda com os
        termos descritos abaixo.
      </p>

      <h2>Cadastro e conta</h2>
      <p>
        Você é responsável por manter a confidencialidade da sua senha e por
        todas as atividades realizadas na sua conta.
      </p>

      <h2>Pedidos e pagamento</h2>
      <p>
        Pedidos são confirmados após a aprovação do pagamento pelo método
        escolhido (Pix, cartão ou Mercado Pago). Preços e disponibilidade de
        estoque podem mudar sem aviso prévio.
      </p>

      <h2>Cancelamento</h2>
      <p>
        Pedidos com status "pendente" ou "processando" podem ser cancelados
        diretamente na página do pedido, em "Meus Pedidos".
      </p>

      <h2>Avaliações</h2>
      <p>
        Avaliações de produtos devem refletir sua experiência real de compra e
        não devem conter conteúdo ofensivo ou enganoso.
      </p>
    </LegalPage>
  )
}
