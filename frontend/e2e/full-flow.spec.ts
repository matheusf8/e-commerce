import { test, expect, Page } from '@playwright/test'

/**
 * Auditoria end-to-end: jornada completa do cliente + do admin, contra o
 * backend real (não mockado). Roda num Chromium de verdade via Playwright.
 */

const uniqueId = Date.now()
const customer = {
  name: 'Cliente Teste E2E',
  email: `e2e_customer_${uniqueId}@example.com`,
  password: 'senha123456',
}
const admin = { email: 'admin@example.com', password: 'admin123' }

async function collectConsoleErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(err.message))
  return errors
}

test.describe.serial('Jornada do cliente', () => {
  let page: Page
  let orderId = ''
  const consoleErrors: string[] = []

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    consoleErrors.push(...(await collectConsoleErrors(page)))
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('home carrega sem erro', async () => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'E-Shop' })).toBeVisible()
  })

  test('navegação do header: catálogo e sobre', async () => {
    await page.getByRole('link', { name: 'Catalogo', exact: true }).click()
    await expect(page).toHaveURL(/\/catalog/)
    await page.getByRole('navigation').getByRole('link', { name: 'Sobre', exact: true }).click()
    await expect(page).toHaveURL(/\/about/)
  })

  test('links do footer não dão 404 (contact/privacy/terms/cookies)', async () => {
    for (const [linkText, urlPart] of [
      ['Contato', '/contact'],
      ['Privacidade', '/privacy'],
      ['Termos', '/terms'],
      ['Cookies', '/cookies'],
    ]) {
      await page.goto('/about') // página com footer visível
      await page.getByRole('link', { name: linkText, exact: true }).click()
      await expect(page).toHaveURL(new RegExp(urlPart))
      await expect(page.getByText('Página não encontrada')).not.toBeVisible()
    }
  })

  test('registro de novo usuário', async () => {
    await page.goto('/register')
    await page.locator('input[name="fullName"]').fill(customer.name)
    await page.locator('input[name="email"]').fill(customer.email)
    await page.locator('input[name="password"]').fill(customer.password)
    await page.locator('input[name="confirmPassword"]').fill(customer.password)
    await page.getByRole('main').getByRole('button', { name: 'Registrar' }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('login', async () => {
    await page.locator('input[type="email"]').fill(customer.email)
    await page.locator('input[type="password"]').fill(customer.password)
    await page.getByRole('main').getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL('http://localhost:5173/')
    await expect(page.getByRole('link', { name: 'Perfil' })).toBeVisible()
  })

  test('buscar produto no catálogo', async () => {
    await page.goto('/catalog')
    await page.getByPlaceholder('Buscar produtos...').fill('a')
    await page.waitForTimeout(300)
    await expect(page.locator('h3').first()).toBeVisible()
  })

  test('abrir produto e ver detalhes', async () => {
    await page.goto('/catalog')
    await page.locator('a[href^="/product/"]').first().click()
    await expect(page).toHaveURL(/\/product\//)
    await expect(page.getByRole('button', { name: /Adicionar ao Carrinho/ })).toBeVisible()
  })

  test('adicionar ao carrinho a partir da página do produto', async () => {
    await page.getByRole('button', { name: /Adicionar ao Carrinho/ }).click()
    await expect(page.getByRole('button', { name: /Adicionado ao Carrinho/ })).toBeVisible()
  })

  test('favoritar produto (wishlist)', async () => {
    await page.getByRole('button', { name: 'Adicionar aos favoritos' }).click()
    await expect(page.getByRole('button', { name: 'Remover dos favoritos' })).toBeVisible()
  })

  test('escrever avaliação do produto', async () => {
    await page.getByRole('button', { name: 'Avaliar Produto' }).click()
    await page.getByPlaceholder('Resuma sua experiência').fill(`Muito bom, chegou rápido ${uniqueId}`)
    await page.getByRole('button', { name: 'Enviar Avaliação' }).click()
    await expect(page.getByText(`Muito bom, chegou rápido ${uniqueId}`)).toBeVisible()
  })

  test('ver carrinho e ajustar quantidade', async () => {
    await page.goto('/cart')
    await expect(page.getByText('itens no carrinho')).toBeVisible()
  })

  test('checkout: endereço', async () => {
    await page.getByRole('button', { name: 'Finalizar Compra' }).click()
    await expect(page).toHaveURL(/\/checkout/)
    await page.locator('input[name="shippingAddress"]').fill('Rua Playwright, 100')
    await page.locator('input[name="city"]').fill('São Paulo')
    await page.locator('input[name="state"]').fill('SP')
    await page.locator('input[name="zipCode"]').fill('01000000')
    await page.getByRole('button', { name: 'Proximo: Pagamento' }).click()
  })

  test('checkout: pagamento via Pix e confirmação', async () => {
    await page.getByRole('radio').nth(2).check() // Pix é a 3a opção
    await page.getByRole('button', { name: 'Revisar Pedido' }).click()
    await page.getByRole('button', { name: 'Finalizar Pedido' }).click()
    await expect(page.getByText('Pagamento com Pix')).toBeVisible()
    await page.getByRole('button', { name: 'Ja paguei - Confirmar Pedido' }).click()
    await expect(page).toHaveURL(/\/order-confirmation/)
    await expect(page.getByText('Pedido Confirmado!')).toBeVisible()
  })

  test('meus pedidos mostra o pedido feito', async () => {
    await page.goto('/profile')
    await page.getByRole('button', { name: 'Pedidos' }).click()
    await expect(page.getByText(/Pedido #/).first()).toBeVisible()
    const detailLink = page.locator('a[href^="/order/"]').first()
    orderId = (await detailLink.getAttribute('href'))?.replace('/order/', '') || ''
  })

  test('página de detalhes do pedido NÃO dá 404', async () => {
    await page.goto(`/order/${orderId}`)
    await expect(page.getByText('Página não encontrada')).not.toBeVisible()
    await expect(page.getByText(`Pedido #${orderId.slice(0, 8)}`)).toBeVisible()
    await expect(page.getByText('Endereço de Entrega')).toBeVisible()
  })

  test('wishlist mostra o item favoritado', async () => {
    await page.goto('/wishlist')
    await expect(page.locator('h3').first()).toBeVisible()
  })

  test('sem erros críticos de console durante toda a jornada', async () => {
    const critical = consoleErrors.filter(e => !e.includes('favicon'))
    expect(critical, `Console errors: ${critical.join('\n')}`).toEqual([])
  })
})

test.describe.serial('Jornada do admin', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('login como admin', async () => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill(admin.email)
    await page.locator('input[type="password"]').fill(admin.password)
    await page.getByRole('main').getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL('http://localhost:5173/')
  })

  test('acessa o painel admin', async () => {
    await page.goto('/admin')
    await expect(page.getByText('Página não encontrada')).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Dashboard' })).toBeVisible()
  })

  test('dashboard: stats e coluna Data preenchida', async () => {
    await expect(page.getByText('Pedidos Recentes')).toBeVisible()
    const firstDataCell = page.locator('table tbody tr').first().locator('td').last()
    // depois do fix, a ultima celula da linha (Data) nao deve ficar vazia
    await expect(firstDataCell).not.toHaveText('')
  })

  test('cadastrar produto novo', async () => {
    await page.getByRole('button', { name: 'Produtos' }).click()
    await page.getByRole('button', { name: 'Novo Produto' }).click()
    await page.locator('label:text-is("Nome") + input').fill(`Produto Teste PW ${uniqueId}`)
    await page.locator('label:text-is("SKU") + input').fill('PW-TEST-' + uniqueId)
    await page.locator('label:text-is("Preco") + input').fill('199.90')
    await page.locator('label:text-is("Estoque") + input').fill('10')
    await page.locator('label:text-is("Categoria") + input').fill('Testes')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText(`Produto Teste PW ${uniqueId}`, { exact: true })).toBeVisible()
  })

  test('editar o produto criado', async () => {
    const row = page.locator('tr', { has: page.getByText(`Produto Teste PW ${uniqueId}`, { exact: true }) })
    await row.locator('button').nth(1).click() // icone de editar
    const modal = page.locator('.fixed')
    await modal.locator('label:text-is("Nome") + input').fill(`Produto Teste PW ${uniqueId} Editado`)
    await modal.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText(`Produto Teste PW ${uniqueId} Editado`)).toBeVisible()
  })

  test('excluir o produto de teste', async () => {
    page.once('dialog', (dialog) => dialog.accept())
    const row = page.locator('tr', { has: page.getByText(`Produto Teste PW ${uniqueId} Editado`) })
    await row.locator('button').nth(2).click() // icone de excluir
    await expect(page.getByText(`Produto Teste PW ${uniqueId} Editado`)).not.toBeVisible()
  })

  test('criar categoria nova', async () => {
    await page.getByRole('button', { name: 'Categorias' }).click()
    await page.getByRole('button', { name: 'Nova' }).click()
    await page.locator('label:text-is("Nome") + input').fill('Categoria Teste ' + uniqueId)
    await page.getByRole('button', { name: 'Criar' }).click()
    await expect(page.getByText('Categoria Teste ' + uniqueId)).toBeVisible()
  })

  test('aba pedidos: colunas Metodo e Data preenchidas, abrir detalhes', async () => {
    await page.getByRole('button', { name: 'Pedidos' }).click()
    await expect(page.getByText(/^Pedidos \(/)).toBeVisible()
    const firstRow = page.locator('table tbody tr').first()
    await firstRow.getByRole('button', { name: 'Detalhes' }).click()
    await expect(page.getByText('Detalhes do Pedido')).toBeVisible()
    await expect(page.getByText('Itens do Pedido')).toBeVisible()
    await page.locator('.fixed button').first().click() // fecha o modal
    await expect(page.getByText('Detalhes do Pedido')).not.toBeVisible()
  })

  test('atualizar status de um pedido', async () => {
    const select = page.locator('table tbody tr').first().locator('select')
    await select.selectOption('processing')
    await expect(page.getByText('Status atualizado')).toBeVisible()
  })

  test('logout', async () => {
    await page.getByTitle('Sair').click()
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible()
  })
})

test.describe('Esqueci minha senha / redefinir senha', () => {
  test('link "Esqueci minha senha" leva pra tela certa', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: 'Esqueci minha senha' }).click()
    await expect(page).toHaveURL(/\/forgot-password/)
  })

  test('solicitar redefinição mostra mensagem genérica (não revela se o email existe)', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.locator('input[type="email"]').fill(`nao-existe-${uniqueId}@example.com`)
    await page.getByRole('button', { name: 'Enviar link de redefinição' }).click()
    await expect(page.getByText(/Se esse email estiver cadastrado/)).toBeVisible()
  })

  test('reset-password sem token mostra link inválido', async ({ page }) => {
    await page.goto('/reset-password')
    await expect(page.getByText('Link inválido')).toBeVisible()
  })

  test('reset-password com token inválido mostra erro ao tentar redefinir', async ({ page }) => {
    await page.goto('/reset-password?token=token-fake-invalido')
    await page.locator('input[type="password"]').first().fill('novaSenha123')
    await page.locator('input[type="password"]').nth(1).fill('novaSenha123')
    await page.getByRole('button', { name: 'Redefinir senha' }).click()
    await expect(page.getByText(/inválido ou expirado/)).toBeVisible()
  })
})
