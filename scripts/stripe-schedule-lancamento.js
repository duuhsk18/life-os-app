// =============================================================================
// STRIPE: programar expiração do cupom LANCAMENTO
// =============================================================================
// Uso: STRIPE_SECRET_KEY=sk_live_xxx node scripts/stripe-schedule-lancamento.js
//
// O que faz:
// - Encontra o promotion code "LANCAMENTO"
// - Programa pra expirar em 31/maio/2026 (~30 dias do lançamento)
// - Limita a 200 redenções totais (proteção contra abuso)
//
// Edite EXPIRES_AT abaixo se quiser data diferente.
// =============================================================================

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY não setado.')
  console.error('   STRIPE_SECRET_KEY=sk_live_xxx node scripts/stripe-schedule-lancamento.js')
  process.exit(1)
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
})

// ⚙️ AJUSTE AQUI:
const PROMOTION_CODE   = 'LANCAMENTO'
const EXPIRES_AT_DATE  = '2026-05-31T23:59:59-03:00' // 31/maio/2026, 23:59 BRT
const MAX_REDEMPTIONS  = 200

async function main() {
  console.log(`🔍 Procurando promotion code "${PROMOTION_CODE}"...\n`)

  // Lista promotion codes ativos
  const list = await stripe.promotionCodes.list({
    active: true,
    code: PROMOTION_CODE,
    limit: 10,
  })

  if (list.data.length === 0) {
    console.error(`❌ Promotion code "${PROMOTION_CODE}" não encontrado.`)
    console.error('   Verifica em https://dashboard.stripe.com/coupons')
    process.exit(1)
  }

  const promo = list.data[0]
  console.log(`Encontrado: ${promo.id}`)
  console.log(`Código: ${promo.code}`)
  console.log(`Cupom subjacente: ${promo.coupon.id} (${promo.coupon.name})`)
  console.log(`Desconto: ${promo.coupon.amount_off ? `R$ ${promo.coupon.amount_off / 100}` : `${promo.coupon.percent_off}%`}`)
  console.log(`Redenções atuais: ${promo.times_redeemed}`)
  console.log()

  // Calcula timestamp Unix (em segundos) da data de expiração
  const expiresAt = Math.floor(new Date(EXPIRES_AT_DATE).getTime() / 1000)

  // Atualiza o promotion code com expiration + max_redemptions
  const updated = await stripe.promotionCodes.update(promo.id, {
    expires_at:      expiresAt,
    max_redemptions: MAX_REDEMPTIONS,
  })

  console.log(`✅ Promotion code atualizado:`)
  console.log(`   Expira em: ${new Date(updated.expires_at * 1000).toLocaleString('pt-BR')}`)
  console.log(`   Limite de redenções: ${updated.max_redemptions}`)
  console.log(`   Restante: ${updated.max_redemptions - updated.times_redeemed}`)
  console.log()
  console.log(`💡 Dica: Quando expirar/esgotar, o campo de cupom continua aparecendo`)
  console.log(`         no checkout (Life OS) mas vai mostrar "código inválido".`)
  console.log(`         Crie um novo código se quiser estender a campanha.`)
}

main().catch((err) => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
