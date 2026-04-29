// =============================================================================
// STRIPE PRODUCTS — helpers pra mapear metadata.internal_slug → slugs internos
// =============================================================================
// Diferente do Kiwify (que usa slug do checkout link como ID), o Stripe permite
// metadata arbitrária por produto. A gente seta metadata.internal_slug em cada
// produto/checkout/payment link, e o webhook lê esse campo direto.
//
// Especiais:
//   - '__KIT_COMPLETO__' (ou 'kit-completo') expande pra 6 entitlements
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
 * lifeos_user_products. Caso especial: kit-completo vira 6 slugs.
 */
export function expandInternalSlug(internalSlug) {
  if (!internalSlug) return []
  if (internalSlug === '__KIT_COMPLETO__' || internalSlug === 'kit-completo') {
    return [...KIT_COMPLETO_SLUGS]
  }
  return [internalSlug]
}

/**
 * Lê os internal_slugs de um Stripe Checkout Session, em ordem de prioridade:
 *   1. session.metadata.internal_slugs (CSV — usado pelo create-checkout-session
 *      com order bumps. Ex: 'receitas-low-carb,kit-completo')
 *   2. session.metadata.internal_slug (singular — usado pelos Payment Links
 *      diretos do Stripe Dashboard)
 *   3. session.subscription_data.metadata.internal_slug (assinaturas)
 *
 * Retorna array de slugs (sem expandir kit-completo ainda).
 */
export function extractStripeInternalSlugs(session) {
  // CSV (multi-item via order bump)
  const csv = session?.metadata?.internal_slugs
  if (csv && typeof csv === 'string') {
    return csv.split(',').map((s) => s.trim()).filter(Boolean)
  }
  // Singular (Payment Link tradicional)
  const single = session?.metadata?.internal_slug
              || session?.subscription_data?.metadata?.internal_slug
  if (single) return [single]
  return []
}

// Mantém compatibilidade — retorna o primeiro slug ou null
export function extractStripeInternalSlug(session) {
  const slugs = extractStripeInternalSlugs(session)
  return slugs[0] || null
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
