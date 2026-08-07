/**
 * Identidade da loja, centralizada num único lugar.
 *
 * Existe pra que este mesmo código possa ser reimplantado pra um cliente
 * novo trocando só variáveis de ambiente (frontend/.env), sem precisar caçar
 * "E-Shop"/"eshop.com"/telefone fake espalhado pelo código (Header, Footer,
 * Contact, Privacy, Terms). Antes de publicar pra um cliente real, preencha
 * VITE_SITE_* no .env com os dados reais dele — os defaults abaixo são só
 * placeholder de demonstração.
 *
 * `rating` e `customerCount` ficam vazios por padrão de propósito: uma loja
 * nova não tem "4.9 de 5 estrelas" nem "+10.000 clientes" ainda, e exibir
 * esses números fabricados pra um cliente de verdade é propaganda enganosa.
 * Só preencha quando o cliente tiver métricas reais pra divulgar.
 */
export const siteConfig = {
  name: import.meta.env.VITE_SITE_NAME || 'E-Shop',
  legalName: import.meta.env.VITE_SITE_LEGAL_NAME || '',
  tagline:
    import.meta.env.VITE_SITE_TAGLINE ||
    'Os melhores produtos com preços incríveis, entrega rápida e garantia de qualidade.',
  supportEmail: import.meta.env.VITE_SITE_EMAIL || 'contato@exemplo.com',
  supportPhone: import.meta.env.VITE_SITE_PHONE || '',
  address: import.meta.env.VITE_SITE_ADDRESS || '',
  rating: import.meta.env.VITE_SITE_RATING || '',
  customerCount: import.meta.env.VITE_SITE_CUSTOMER_COUNT || '',
}
