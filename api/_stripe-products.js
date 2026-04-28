// =============================================================================
// STRIPE PRODUCTS — helpers pra mapear metadata.internal_slug → slugs internos
// =============================================================================
// Diferente do Kiwify (que usa slug do checkout link como ID), o Stripe permite
// metadata arbitrária por produto. A gente seta metadata.internal_slug em cada
// produto/checkout/payment link, e o webhook lê esse campo direto.
//
// Especiais:
//   - '__KIT_COMPLETO__' expande pra 6 entitlements
//   - 'life-os' é assinatura (recurring)
// =============================================================================

export const KIT_COMPLETO_SLUGS = [
  'receitas-low-carb',
  'planilhas-treino',
  'receitas-indigenas',
  'templates-notion',
  'ebooks-autoajuda',
  'planilhas-financeiras',
]

/**
 * Expande um internal_slug em uma lista de slugs concretos pra inserir em
 * lifeos_user_products. Caso especial: __KIT_COMPLETO__ vira 6 slugs.
 */
export function expandInternalSlug(internalSlug) {
  if (!internalSlug) return []
  if (internalSlug === '__KIT_COMPLETO__') return [...KIT_COMPLETO_SLUGS]
  return [internalSlug]
}

/**
 * Lê o internal_slug de um Stripe Checkout Session.
 * Tenta na ordem:
 *   1. session.metadata.internal_slug (Payment Link copia a metadata pra session)
 *   2. session.subscription_data.metadata.internal_slug (raros casos de sub)
 */
export function extractStripeInternalSlug(session) {
  return (
    session?.metadata?.internal_slug ||
    session?.subscription_data?.metadata?.internal_slug ||
    null
  )
}

/**
 * Lê email do cliente do Checkout Session.
 */
export function extractStripeEmail(session) {
  return (
    session?.customer_details?.email ||
    session?.customer_email ||
    null
  )
}

/**
 * Lê nome do cliente do Checkout Session.
 */
export function extractStripeName(session) {
  return (
    session?.customer_details?.name ||
    'Membro'
  )
}
