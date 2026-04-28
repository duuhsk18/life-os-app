// =============================================================================
// STRIPE BOOTSTRAP — cria todos os produtos, prices e payment links de uma vez
// =============================================================================
// Roda LOCALMENTE com:
//   STRIPE_SECRET_KEY=sk_live_... node scripts/stripe-bootstrap.js
//
// Idempotente: roda múltiplas vezes sem criar duplicatas (usa metadata.internal_slug
// pra detectar produtos existentes).
//
// Output: imprime as URLs dos Payment Links pra você colar no sales-data.js.
// =============================================================================

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Falta STRIPE_SECRET_KEY no env')
  process.exit(1)
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
const SITE_URL = process.env.SITE_URL || 'https://www.agenciacriativa.shop'

// =============================================================================
// CATÁLOGO — fonte da verdade
// =============================================================================

const PRODUCTS_TO_CREATE = [
  {
    internalSlug:  'receitas-low-carb',
    name:          'Receitas Low Carb',
    description:   '80+ receitas low carb testadas, com cardápio semanal e lista de compras.',
    priceBRL:      27.90,
    type:          'one_time',
  },
  {
    internalSlug:  'planilhas-treino',
    name:          'Planilhas de Treino',
    description:   '12 semanas de treino periodizado: hipertrofia, emagrecimento e funcional.',
    priceBRL:      27.90,
    type:          'one_time',
  },
  {
    internalSlug:  'receitas-indigenas',
    name:          'Receitas Indígenas',
    description:   '60+ receitas ancestrais brasileiras com versão vegana e sem glúten.',
    priceBRL:      27.90,
    type:          'one_time',
  },
  {
    internalSlug:  'templates-notion',
    name:          '7 Ferramentas Interativas',
    description:   'Templates Notion para vida pessoal, estudos, finanças e produtividade.',
    priceBRL:      27.90,
    type:          'one_time',
  },
  {
    internalSlug:  'ebooks-autoajuda',
    name:          'Coleção 5 Ebooks de Autoajuda',
    description:   'Disciplina, mentalidade de crescimento, foco, limites e realização.',
    priceBRL:      27.90,
    type:          'one_time',
  },
  {
    internalSlug:  'planilhas-financeiras',
    name:          '8 Planilhas Financeiras',
    description:   'Controle de gastos, dívidas, investimentos, FIRE e dashboard financeiro.',
    priceBRL:      27.90,
    type:          'one_time',
  },
  {
    internalSlug:  '__KIT_COMPLETO__',
    name:          'Kit Completo — Todos os 6 Produtos',
    description:   'Receitas Low Carb + Planilhas de Treino + Receitas Indígenas + Templates Notion + 5 Ebooks + 8 Planilhas Financeiras.',
    priceBRL:      47.00,
    type:          'one_time',
  },
  {
    internalSlug:  'life-os',
    name:          'Life OS — Clube de Membros',
    description:   'Sistema gamificado (hábitos, treinos, journal, finanças) + biblioteca completa dos 6 produtos + materiais novos todo mês.',
    priceBRL:      79.90,
    type:          'subscription',
    promoCoupon: {
      name:        'Primeiro mês com R$20 OFF',
      amountOffBRL: 20,
      duration:    'once',
    },
  },
]

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  STRIPE BOOTSTRAP — Agência Criativa')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log()

  // 1. Lista produtos existentes (pra idempotência)
  const existing = {}
  for await (const product of stripe.products.list({ active: true, limit: 100 })) {
    const slug = product.metadata?.internal_slug
    if (slug) existing[slug] = product
  }
  console.log(`Encontrados ${Object.keys(existing).length} produto(s) existente(s) com internal_slug`)
  console.log()

  const results = []

  // 2. Cria/atualiza cada produto
  for (const cfg of PRODUCTS_TO_CREATE) {
    console.log(`▶ ${cfg.internalSlug}`)

    let product = existing[cfg.internalSlug]
    if (product) {
      console.log(`  ✓ Produto existe: ${product.id}`)
    } else {
      product = await stripe.products.create({
        name:        cfg.name,
        description: cfg.description,
        metadata:    { internal_slug: cfg.internalSlug },
      })
      console.log(`  ✓ Produto criado: ${product.id}`)
    }

    // Verifica se já tem price ativo no valor certo
    const prices = await stripe.prices.list({ product: product.id, active: true, limit: 10 })
    const targetCents = Math.round(cfg.priceBRL * 100)
    let price = prices.data.find((p) => {
      if (p.unit_amount !== targetCents) return false
      if (cfg.type === 'subscription') return p.recurring?.interval === 'month'
      return !p.recurring
    })

    if (price) {
      console.log(`  ✓ Price existe: ${price.id} (R$ ${cfg.priceBRL})`)
    } else {
      const priceParams = {
        product:     product.id,
        currency:    'brl',
        unit_amount: targetCents,
      }
      if (cfg.type === 'subscription') {
        priceParams.recurring = { interval: 'month' }
      }
      price = await stripe.prices.create(priceParams)
      console.log(`  ✓ Price criado: ${price.id} (R$ ${cfg.priceBRL})`)
    }

    // Cupom promocional (Life OS first month)
    let promoCoupon = null
    if (cfg.promoCoupon) {
      const couponMetaKey = `${cfg.internalSlug}-promo`
      const allCoupons = await stripe.coupons.list({ limit: 100 })
      promoCoupon = allCoupons.data.find((c) => c.metadata?.bootstrap_key === couponMetaKey)
      if (promoCoupon) {
        console.log(`  ✓ Cupom existe: ${promoCoupon.id}`)
      } else {
        promoCoupon = await stripe.coupons.create({
          name:        cfg.promoCoupon.name,
          amount_off:  Math.round(cfg.promoCoupon.amountOffBRL * 100),
          currency:    'brl',
          duration:    cfg.promoCoupon.duration,
          metadata:    { bootstrap_key: couponMetaKey },
        })
        console.log(`  ✓ Cupom criado: ${promoCoupon.id}`)
      }
    }

    // Payment Link
    const linkParams = {
      line_items: [{ price: price.id, quantity: 1 }],
      metadata:   { internal_slug: cfg.internalSlug },
      after_completion: {
        type: 'redirect',
        redirect: { url: `${SITE_URL}/minha-conta?stripe_success=1` },
      },
    }

    if (cfg.type === 'subscription' && promoCoupon) {
      linkParams.subscription_data = {
        metadata: { internal_slug: cfg.internalSlug },
      }
      linkParams.discounts = [{ coupon: promoCoupon.id }]
    }

    // Lista links existentes pra esse produto
    const allLinks = await stripe.paymentLinks.list({ active: true, limit: 100 })
    let link = allLinks.data.find((l) => l.metadata?.internal_slug === cfg.internalSlug)
    if (link) {
      console.log(`  ✓ Payment Link existe: ${link.url}`)
    } else {
      link = await stripe.paymentLinks.create(linkParams)
      console.log(`  ✓ Payment Link criado: ${link.url}`)
    }

    results.push({
      internalSlug: cfg.internalSlug,
      productId:    product.id,
      priceId:      price.id,
      paymentLink:  link.url,
    })
    console.log()
  }

  // 3. Configura webhook endpoint
  console.log('━━━ WEBHOOK ENDPOINT ━━━')
  const webhookUrl = `${SITE_URL}/api/stripe-webhook`
  const allWebhooks = await stripe.webhookEndpoints.list({ limit: 100 })
  let webhook = allWebhooks.data.find((w) => w.url === webhookUrl)
  if (webhook) {
    console.log(`  ✓ Webhook existe: ${webhook.id}`)
    console.log(`  ⚠ Signing secret só aparece na criação. Se você não tem o STRIPE_WEBHOOK_SECRET no Vercel, delete o webhook no Dashboard e rode esse script de novo.`)
  } else {
    webhook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: [
        'checkout.session.completed',
        'charge.refunded',
        'customer.subscription.deleted',
      ],
      description: 'Life OS — grant/revoke entitlements',
    })
    console.log(`  ✓ Webhook criado: ${webhook.id}`)
    console.log()
    console.log(`  🔑 STRIPE_WEBHOOK_SECRET (adicione no Vercel env vars):`)
    console.log(`     ${webhook.secret}`)
  }
  console.log()

  // 4. Output final
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  RESUMO — cole isso quando atualizar sales-data.js')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log()
  console.log(JSON.stringify(results, null, 2))
}

main().catch((err) => {
  console.error('Erro:', err)
  process.exit(1)
})
