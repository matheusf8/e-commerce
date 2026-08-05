# Deploy de produção

Checklist concreto pra tirar o projeto de `localhost` e colocar no ar de verdade,
com domínio próprio, pagamento real e e-mail real. Ordem sugerida: backend →
frontend → domínio → ligar os serviços externos em modo produção → teste
ponta a ponta.

Todo passo abaixo é feito fora deste repo (dashboards de Render/Vercel/etc) —
o que o repo já tem pronto pra isso é `render.yaml` (raiz) e
`frontend/vercel.json`.

## 0. Antes de tudo

- [ ] Gere um `SECRET_KEY` novo e forte (não reaproveite o de dev). Se for pelo
      Render Blueprint abaixo, ele gera sozinho — não precisa fazer nada.
      Manual: `python -c "import secrets; print(secrets.token_urlsafe(32))"`.
- [ ] Decida a URL final do backend e do frontend antes de mexer em Mercado Pago
      (ele precisa das duas pra `back_urls` e pro webhook).

## 1. Backend + banco (Render)

1. Crie conta em https://render.com (dá pra logar com GitHub).
2. **New > Blueprint**, aponte pro repositório — o Render lê o `render.yaml` da
   raiz e sobe sozinho: um Postgres (`ecommerce-db`) + o Web Service do backend
   (`ecommerce-backend`, via `backend/Dockerfile`), já com `DATABASE_URL` ligado
   ao banco e `SECRET_KEY` gerado automaticamente.
3. No dashboard do serviço `ecommerce-backend` → **Environment**, preencha as
   variáveis que o blueprint deixou em branco de propósito (segredos não vão pro
   git):
   - `ALLOWED_ORIGINS` — domínio do frontend (passo 2), ex.
     `https://sualoja.vercel.app,https://sualoja.com.br`
   - `FRONTEND_URL` / `BACKEND_URL` — as duas em `https://`, senão o Mercado
     Pago não liga o `auto_return` nem o webhook (comportamento documentado e
     esperado, não é bug)
   - `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` — ver [docs/PAGAMENTO_MERCADO_PAGO.md](./PAGAMENTO_MERCADO_PAGO.md);
     em produção de verdade isso é a credencial `APP_USR-...` **do dono do
     negócio**, não uma sua de teste
   - `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` —
     conta grátis em https://cloudinary.com/console
   - `RESEND_API_KEY`, `EMAIL_FROM` — conta grátis em https://resend.com/api-keys.
     Sem domínio próprio verificado no Resend, use `EMAIL_FROM=E-Shop <onboarding@resend.dev>`
     (funciona, mas mostra "via resend.dev" na caixa de entrada — pra remetente
     limpo, verificar um domínio no Resend, grátis)
4. Deploy. Ele roda `alembic upgrade head` e sobe o Uvicorn (ver `backend/start.sh`).
   `SEED_DB` fica em `false` por padrão — só ligue manualmente (env var
   `SEED_DB=true` numa única execução) se quiser popular esse ambiente com o
   catálogo de exemplo; nunca num ambiente com dados reais de cliente.
5. Confira `https://<seu-backend>.onrender.com/health` → `{"status":"ok"}`.

> Plano free do Render "dorme" depois de inatividade (primeira requisição fica
> lenta) e o Postgres free expira em 90 dias — ok pra teste, considere o plano
> pago antes de repassar pra um cliente de verdade.

## 2. Frontend (Vercel)

1. Crie conta em https://vercel.com (GitHub).
2. **Add New > Project**, aponte pro mesmo repositório, **Root Directory:
   `frontend`**. A Vercel detecta Vite sozinha (`npm run build`, saída `dist`).
   O `frontend/vercel.json` já está no repo — resolve o 404 que aconteceria ao
   abrir direto uma rota tipo `/product/123` (SPA com `react-router`, sem isso
   só a home responde).
3. Em **Environment Variables**: `VITE_API_URL=https://<seu-backend>.onrender.com/api`
   (a URL do passo 1, com `/api` no final).
4. Deploy. Depois volte no passo 1 e coloque essa URL da Vercel em
   `ALLOWED_ORIGINS`/`FRONTEND_URL` do backend, se ainda não tiver posto.

## 3. Domínio próprio

1. Compre o domínio (Registro.br pra `.com.br`, ou Vercel/qualquer registrar pra
   `.com`).
2. Frontend: no projeto da Vercel → **Settings > Domains**, adicione o domínio;
   ela mostra o registro DNS exato pra criar no seu registrar (geralmente um
   `CNAME` ou os `A`/`ALIAS` da Vercel).
3. Backend: opcional ter domínio próprio nele (dá pra deixar no
   `onrender.com` mesmo) — se quiser, mesma lógica em **Settings > Custom Domains**
   do Render.
4. Depois que o domínio propagar (minutos a poucas horas), atualize
   `ALLOWED_ORIGINS`/`FRONTEND_URL` no backend e `VITE_API_URL` no frontend se
   o domínio do backend também mudou, e redeploy os dois.

## 4. Mercado Pago em modo produção

Guia completo em [docs/PAGAMENTO_MERCADO_PAGO.md](./PAGAMENTO_MERCADO_PAGO.md).
Resumo pra produção:

- [ ] `MP_ACCESS_TOKEN` = credencial de **produção** (`APP_USR-...`) da conta
      Mercado Pago de quem vai *receber* o dinheiro — não a sua conta de teste.
- [ ] `MP_WEBHOOK_SECRET` = "Chave secreta" da seção Webhooks daquela mesma
      aplicação no painel do Mercado Pago.
- [ ] `BACKEND_URL` já em `https://` (passo 1) — é isso que liga o webhook.
- [ ] Fazer uma compra real de valor baixo pra confirmar o fluxo de ponta a
      ponta antes de anunciar a loja.

## 5. Checklist final antes de ir ao ar

- [ ] `ENVIRONMENT=production` no backend (o Render Blueprint já seta isso)
- [ ] `SEED_DB` não está `true` num ambiente com catálogo real
- [ ] Senha do `admin@example.com` trocada (ou usuário admin recriado com outro
      e-mail/senha) — a senha `admin123` do seed é pública neste repo
- [ ] `SECRET_KEY` não é o valor de exemplo do `.env.example`
- [ ] Teste manual: cadastro → login → carrinho → checkout (todas as formas de
      pagamento habilitadas) → pedido aparece no admin → e-mail de confirmação
      chega
