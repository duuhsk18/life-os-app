// =============================================================================
// MAPA DE PRODUTOS KIWIFY → SLUGS INTERNOS
// =============================================================================
// IDs/slugs vindos das URLs de checkout do Kiwify (pay.kiwify.com.br/{ID}).
// Em caso de Kiwify enviar um UUID diferente no webhook, o resolveProducts...
// também tenta casar pelo nome do produto como fallback.
//
// IMPORTANTE: o webhook do Kiwify pode envelopar o payload em { order: {...} }.
// Os helpers abaixo desempacotam isso transparentemente.
// =============================================================================

export const KIWIFY_PRODUCT_MAP = {
  // ---- Produtos individuais (Pagamento único, R$ 27,90) ----
  't6uEnAV': 'receitas-low-carb',
  'SVIdTH1': 'planilhas-treino',
  'RQ2dquE': 'receitas-indigenas',
  'rOhF5tb': 'templates-notion',
  'BRmsMyl': 'ebooks-autoajuda',
  'vQr2l3A': 'planilhas-financeiras',

  // ---- Kit Completo (R$ 47) → expande em 6 entitlements ----
  '4EIEFJg': '__KIT_COMPLETO__',

  // ---- Life OS (Assinatura R$ 59,90 → R$ 79,90/mês) ----
  '0K0Js0r': 'life-os',
}

// Fallback por nome — caso Kiwify envie um UUID em vez do slug
// Match é case-insensitive e busca substring no product_name do payload
export const KIWIFY_NAME_FALLBACK = [
  { match: /low\s*carb/i,                    slug: 'receitas-low-carb' },
  { match: /planilhas?\s*de?\s*treino/i,     slug: 'planilhas-treino' },
  { match: /ind[ií]genas?/i,                 slug: 'receitas-indigenas' },
  { match: /(notion|ferramentas?\s*interat)/i, slug: 'templates-notion' },
  { match: /(ebooks?|autoajuda|cole[çc][ãa]o\s*5)/i, slug: 'ebooks-autoajuda' },
  { match: /(financeiras?|finan[çc]as)/i,    slug: 'planilhas-financeiras' },
  { match: /kit\s*completo/i,                slug: '__KIT_COMPLETO__' },
  { match: /life\s*os/i,                     slug: 'life-os' },
]

export const KIT_COMPLETO_SLUGS = [
  'receitas-low-carb',
  'planilhas-treino',
  'receitas-indigenas',
  'templates-notion',
  'ebooks-autoajuda',
  'planilhas-financeiras',
]

/**
 * Desempacota o body do webhook Kiwify.
 * Kiwify pode enviar o payload de 2 formas:
 *   - direto:   { order_status, Customer, Product, ... }
 *   - envelope: { url, signature, order: { order_status, Customer, Product, ... } }
 * Esta função sempre retorna o objeto com os dados do pedido.
 */
export function unwrapKiwifyBody(body) {
  if (!body) return {}
  return body.order || body.Order || body
}

/**
 * Resolve um product_id (ou checkout_link, ou nome) do Kiwify para slugs internos.
 * Tenta na ordem:
 *   1. Match exato em KIWIFY_PRODUCT_MAP (pelo ID/slug do checkout)
 *   2. Match por checkout_link
 *   3. Fallback por regex no product_name
 */
export function resolveProductsFromKiwify(kiwifyProductId, productName = '') {
  // 1. Match direto pelo ID
  if (kiwifyProductId && KIWIFY_PRODUCT_MAP[kiwifyProductId]) {
    return expandSlug(KIWIFY_PRODUCT_MAP[kiwifyProductId])
  }

  // 2. Fallback por nome (regex)
  if (productName) {
    for (const { match, slug } of KIWIFY_NAME_FALLBACK) {
      if (match.test(productName)) {
        return expandSlug(slug)
      }
    }
  }

  return []
}

function expandSlug(slug) {
  if (slug === '__KIT_COMPLETO__') return [...KIT_COMPLETO_SLUGS]
  return [slug]
}

/**
 * Lê o product_id (ou checkout_link) do payload Kiwify.
 * O Kiwify usa product_id como UUID interno. Como nosso mapa usa o
 * checkout_link (slug do final da URL pay.kiwify.com.br/XXX), tentamos
 * o checkout_link primeiro pra dar match com o KIWIFY_PRODUCT_MAP.
 */
export function extractKiwifyProductId(body) {
  const data = unwrapKiwifyBody(body)
  return (
    // Checkout link é o que casa com nosso mapa (vem da URL pay.kiwify.com.br/XXX)
    data?.checkout_link ||
    data?.Product?.checkout_link ||
    data?.product?.checkout_link ||
    // Fallback: product_id (UUID) — não bate com nosso mapa atual mas pode ser usado
    data?.Product?.product_id ||
    data?.product?.product_id ||
    data?.product_id ||
    data?.Product?.id ||
    data?.product?.id ||
    null
  )
}

/** Lê o nome do produto do payload Kiwify. */
export function extractKiwifyProductName(body) {
  const data = unwrapKiwifyBody(body)
  return (
    data?.Product?.product_name ||
    data?.product?.product_name ||
    data?.product?.name ||
    data?.Product?.name ||
    data?.product_name ||
    ''
  )
}

/** Lê o e-mail do cliente do payload Kiwify. */
export function extractKiwifyEmail(body) {
  const data = unwrapKiwifyBody(body)
  return (
    data?.Customer?.email ||
    data?.customer?.email ||
    data?.email ||
    null
  )
}

/** Lê o nome completo do cliente do payload Kiwify. */
export function extractKiwifyName(body) {
  const data = unwrapKiwifyBody(body)
  return (
    data?.Customer?.full_name ||
    data?.Customer?.name ||
    data?.customer?.full_name ||
    data?.customer?.name ||
    'Membro'
  )
}

/** Lê o status do pedido do payload Kiwify. */
export function extractKiwifyStatus(body) {
  const data = unwrapKiwifyBody(body)
  return data?.order_status || data?.status || null
}

/** Lê o order_id do payload Kiwify. */
export function extractKiwifyOrderId(body) {
  const data = unwrapKiwifyBody(body)
  return (
    data?.order_id ||
    data?.Order?.order_id ||
    data?.order_ref ||
    null
  )
}
