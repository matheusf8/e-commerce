import { LegalPage } from './LegalPage'

export function Cookies() {
  return (
    <LegalPage title="Política de Cookies" updatedAt="Agosto de 2026">
      <p>
        Usamos armazenamento local do navegador (localStorage) para manter você
        conectado e lembrar preferências durante a navegação.
      </p>

      <h2>O que armazenamos</h2>
      <p>
        Token de acesso e refresh token (login), dados do formulário de checkout
        em andamento, e o último pedido realizado — tudo guardado localmente no
        seu navegador, nunca compartilhado com terceiros.
      </p>

      <h2>Como limpar</h2>
      <p>
        Você pode remover esses dados a qualquer momento fazendo logout ou
        limpando os dados do site nas configurações do seu navegador.
      </p>
    </LegalPage>
  )
}
