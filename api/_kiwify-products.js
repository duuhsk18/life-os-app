// =============================================================================
// MAPA DE PRODUTOS KIWIFY → SLUGS INTERNOS
// =============================================================================
// PREENCHA OS IDs aqui depois de criar os produtos no Kiwify.
// Cada produto criado no painel Kiwify tem um product_id (uuid ou código curto).
// Você encontra em "Configurações do produto" → URL do produto, ou ao listar produtos.
//
// Exemplo de payload Kiwify (campo que importa):
//   body.Product.product_id  ou  body.product.product_id  ou  body.product_id
// =============================================================================

export const KIWIFY_PRODUCT_MAP = {
  // ---- Produtos individuais (Pagamento único, R$ 27,90) ----
  'KIWIFY_ID_RECEITAS_LOW_CARB':   'receitas-low-carb',
  'KIWIFY_ID_PLANILHAS_TREINO':    'planilhas-treino',
  'KIWIFY_ID_RECEITAS_INDIGENAS':  'receitas-indigenas',
  'KIWIFY_ID_TEMPLATES_NOTION':    'templates-notion',
  'KIWIFY_ID_EBOOKS_AUTOAJUDA':    'ebooks-autoajuda',
  'KIWIFY_ID_PLANILHAS_FINANCAS':  'planilhas-financeiras',

  // ---- Kit Completo (R$ 47) — expande em 6 entitlements ----
  'KIWIFY_ID_KIT_COMPLETO':        '__KIT_COMPLETO__',

  // ---- Life OS (Assinatura mensal) ----
  'KIWIFY_ID_LIFE_OS':             'life-os',
}

export const KIT_COMPLETO_SLUGS = [
  'receitas-low-carb',
  'planilhas-treino',
  'receitas-indigenas',
  'templates-notion',
  'ebooks-autoajuda',
  'planilhas-financeiras',
]

/**
 * Resolve um product_id do Kiwify para uma lista de slugs internos.
 *  - Produto individual → 1 slug
 *  - Kit Completo       → 6 slugs (todos os individuais)
 *  - Life OS            → 1 slug ('life-os')
 *  - ID desconhecido    → [] (e webhook loga aviso)
 */
export function resolveProductsFromKiwify(kiwifyProductId) {
  if (!kiwifyProductId) return []
  const slug = KIWIFY_PRODUCT_MAP[kiwifyProductId]
  if (!slug) return []
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
    null
  )
}
