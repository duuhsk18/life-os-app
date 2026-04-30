// =============================================================================
// CREATE CHECKOUT SESSION — cria sessão dinâmica do Stripe com 1+ produtos
// =============================================================================
// Usado pelo CheckoutPage pra gerar uma URL de pagamento que pode incluir
// o produto principal + bumps que o cliente marcou.
//
// Body: { items: ['receitas-low-carb', 'kit-completo'], email?: 'opcional@email.com' }
// Returns: { url: 'https://checkout.stripe.com/c/pay/cs_live_...' }
//
// O webhook (api/stripe-webhook.js) detecta os line_items e libera os
// entitlements correspondentes via metadata.internal_slug por line.
// =============================================================================

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
})

// Map slug → Stripe Price ID (espelhado em src/lib/sales-data.js)
const PRICES = {
  'receitas-low-carb':     'price_1TRNu0Fl5Mui7NRgQHCV7etc',
  'planilhas-treino':      'price_1TRNu2Fl5Mui7NRg10yWSTRj',
  'receitas-indigenas':    'price_1TRNu3Fl5Mui7NRg6w5SFF3r',
  'templates-notion':      'price_1TRNu5Fl5Mui7NRgC43w62O2',
  'ebooks-autoajuda':      'price_1TRNu6Fl5Mui7NRgKgCaTdPj',
  'planilhas-financeiras': 'price_1TRNu8Fl5Mui7NRga8KDW8m5',
  'kit-completo':          'price_1TRNu9Fl5Mui7NRgXu4aRPLN',
  'life-os':               'price_1TRNuBFl5Mui7NRgrz7Z9pNy',
}

// Slugs que são subscription (cobrança recorrente). Os outros são one-time.
const SUBSCRIPTION_SLUGS = new Set(['life-os'])

const SITE = process.env.SITE_URL || 'https://www.agenciacriativa.shop'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { items, email } = req.body || {}

  // Validações
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'invalid_items' })
  }

  // Filtra slugs válidos
  const validItems = items.filter((s) => typeof s === 'string' && PRICES[s])
  if (validItems.length === 0) {
    return res.status(400).json({ error: 'no_valid_items' })
  }

  // Determina mode: subscription se tiver life-os, senão payment
  const hasSubscription = validItems.some((s) => SUBSCRIPTION_SLUGS.has(s))
  if (hasSubscription && validItems.length > 1) {
    // Mistura de subscription + one-time = complicado. Limita por enquanto.
    // Melhor não permitir bump em Life OS.
    return res.status(400).json({ error: 'cannot_combine_subscription_with_other_items' })
  }

  const mode = hasSubscription ? 'subscription' : 'payment'

  // Monta line_items
  // Cada line_item recebe metadata interna que o webhook usa pra liberar acesso
  const line_items = validItems.map((slug) => ({
    price:    PRICES[slug],
    quantity: 1,
  }))

  // Cupom LANCAMENTO: APENAS quando Life OS está no carrinho.
  // Pra produtos avulsos (R$27,90), R$20 off = quase prejuízo. Só faz sentido pro
  // Life OS (R$59,90 → R$39,90 mantém margem). Cobertura via allow_promotion_codes.
  const allow_promotion_codes = hasSubscription

  try {
    const sessionParams = {
      mode,
      line_items,
      allow_promotion_codes,
      success_url: `${SITE}/obrigado?slugs=${encodeURIComponent(validItems.join(','))}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${SITE}/p/${validItems[0]}`,
      metadata: {
        // Slugs como string CSV pra fácil leitura no webhook
        internal_slugs: validItems.join(','),
        source:         'custom_checkout',
      },
    }

    // Se for subscription, adiciona metadata na sub também (webhook lê de lá)
    if (mode === 'subscription') {
      sessionParams.subscription_data = {
        metadata: {
          internal_slug: validItems[0],
        },
      }
    }

    // Email pré-preenchido (UX)
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      sessionParams.customer_email = email.trim().toLowerCase()
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return res.status(200).json({ url: session.url, id: session.id })
  } catch (err) {
    console.error('[create-checkout-session] erro:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
