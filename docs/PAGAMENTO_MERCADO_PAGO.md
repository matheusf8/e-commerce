# Pagamento real (sandbox) com Mercado Pago

O checkout tem um 4º método de pagamento, "Mercado Pago", que usa o **Checkout Pro**
(página de pagamento hospedada pelo próprio Mercado Pago). É uma integração real —
token de API real, fluxo real — rodando em **modo de teste/sandbox**: nenhum dinheiro
de verdade é movimentado, desde que você use as credenciais e os cartões corretos
abaixo.

## 1. Pegar as credenciais de TESTE

1. Acesse https://www.mercadopago.com.br/developers/panel/app e crie uma conta/aplicação
   gratuita, se ainda não tiver.
2. Dentro da aplicação, vá na aba **"Credenciais de teste"** (não "Credenciais de produção").
3. Copie o campo **Access Token** — ele começa com `TEST-...`.
   - ⚠️ Nunca use o Access Token de produção (`APP_USR-...`) aqui. Esse processa pagamentos de verdade.

## 2. Configurar o projeto

No `backend/.env`:

```bash
MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FRONTEND_URL=http://localhost:5173
```

Reinicie o backend depois de editar o `.env`.

## 3. Testar o pagamento

1. Abra `http://localhost:5173`, adicione um produto ao carrinho e vá pro checkout.
2. Escolha o método **"Mercado Pago"** e finalize o pedido — você será redirecionado
   pra página de pagamento real do Mercado Pago (ambiente sandbox).
3. Use um dos [cartões de teste oficiais](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/your-integrations/test/cards):

   | Bandeira   | Número              | Validade  | CVV | Nome do titular |
   |------------|---------------------|-----------|-----|------------------|
   | Mastercard | 5031 4332 1540 6351 | qualquer futura | 123 | `APRO` (aprova) |
   | Mastercard | 5031 4332 1540 6351 | qualquer futura | 123 | `OTHE` (recusa) |
   | Visa       | 4235 6477 2802 5682 | qualquer futura | 123 | `APRO` (aprova) |

   O nome do titular controla o resultado: `APRO` sempre aprova, `OTHE` sempre recusa
   — útil pra testar os dois caminhos sem depender de sorte.
4. Depois de pagar, o Mercado Pago redireciona de volta pra
   `/order-confirmation?order_id=...&payment_id=...`. O frontend chama
   `POST /api/orders/{id}/mp-sync`, que busca o status **real** direto na API do
   Mercado Pago (nunca confia só no que vem na URL) e atualiza o pedido.

## Webhook (confirmação automática, sem depender do redirect)

O endpoint `POST /api/orders/webhook/mercadopago` já existe no código e é chamado
pelo próprio Mercado Pago quando o status de um pagamento muda — funciona mesmo
que o cliente feche a aba antes de voltar pro site. Ele só ativa quando:

1. `BACKEND_URL` no `.env` aponta pra uma URL `https://` pública (localhost não serve
   — o Mercado Pago precisa conseguir alcançar o endpoint pela internet).
2. `MP_WEBHOOK_SECRET` está configurado — pegue a "Chave secreta" na seção
   "Webhooks" do painel da sua aplicação no Mercado Pago. Sem isso, qualquer um
   poderia forjar uma notificação de pagamento aprovado; o código verifica a
   assinatura HMAC antes de processar.

## Limitações desta integração (modo dev local)

- **Sem webhook em localhost**: o Mercado Pago não consegue notificar automaticamente
  um `localhost`, então em dev a confirmação depende do redirect de volta + `/mp-sync`.
  Se o usuário fechar a aba antes de voltar, o pedido fica `pending` até alguém chamar
  `/mp-sync` de novo — o webhook (ver acima) resolve isso, mas só depois do deploy.
- Pra produção de verdade: trocar `MP_ACCESS_TOKEN` pelo de produção (`APP_USR-...`),
  e configurar `BACKEND_URL`/`MP_WEBHOOK_SECRET` como descrito acima.
