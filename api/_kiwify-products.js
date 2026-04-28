// =============================================================================
// MAPA DE PRODUTOS KIWIFY → SLUGS INTERNOS
// =============================================================================
// IDs/slugs vindos das URLs de checkout do Kiwify (pay.kiwify.com.br/{ID}).
// Em caso de Kiwify enviar um UUID diferente no webhook, o resolveProducts...
// também tenta casar pelo nome do produto como fallback.
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
 * Resolve um product_id do Kiwify (ou nome) para uma lista de slugs internos.
 * Tenta na ordem:
 *   1. Match exato em KIWIFY_PRODUCT_MAP (pelo ID/slug do checkout)
 *   2. Fallback por regex no product_name
 */
export function resolveProductsFromKiwify(kiwifyProductId, productName = '') {
  // 1. Match direto pelo ID
  if (kiwifyProductId && KIWIFY_PRODUCT_MAP[kiwifyProductId]) {
    return expandSlug(KIWIFY_PRODUCT_MAP[kiwifyProductId])
  }

  // 2. Fallback por nome
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

/** Lê o product_id do payload Kiwify, cobrindo as variações conhecidas. */
export function extractKiwifyProductId(body) {
  return (
    body?.Product?.product_id ||
    body?.product?.product_id ||
    body?.product_id ||
    body?.Product?.id ||
    body?.product?.id ||
    body?.Product?.checkout_link ||
    body?.checkout_link ||
    null
  )
}

/** Lê o nome do produto do payload Kiwify. */
export function extractKiwifyProductName(body) {
  return (
    body?.Product?.product_name ||
    body?.product?.product_name ||
    body?.product?.name ||
    body?.Product?.name ||
    body?.product_name ||
    ''
  )
}
