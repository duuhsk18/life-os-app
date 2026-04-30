// =============================================================================
// STRIPE: programar expiração do cupom LANCAMENTO
// =============================================================================
// Uso: STRIPE_SECRET_KEY=sk_live_xxx node scripts/stripe-schedule-lancamento.js
//
// O que faz:
// - Encontra o promotion code "LANCAMENTO" ativo
// - Detecta se já tem expiração programada
// - Se NÃO tem: desativa o atual + cria um NOVO com mesmo código,
//   mesmo cupom, mas com expires_at + max_redemptions setados
// - Stripe não permite editar expires_at depois de criado, então
//   precisamos recriar (deactivate-then-create).
//
// Edite EXPIRES_AT_DATE / MAX_REDEMPTIONS abaixo se quiser ajustar.
// =============================================================================

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY não setado.')
  console.error('   STRIPE_SECRET_KEY=sk_live_xxx node scripts/stripe-schedule-lancamento.js')
  process.exit(1)
}

const isLive = process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
})

// ⚙️ AJUSTE AQUI:
const PROMOTION_CODE   = 'LANCAMENTO'
const EXPIRES_AT_DATE  = '2026-05-31T23:59:59-03:00' // 31/maio/2026, 23:59 BRT
const MAX_REDEMPTIONS  = 200

async function main() {
  console.log(`Modo: ${isLive ? '🔴 LIVE (produção)' : '🧪 TEST (sandbox)'}`)
  if (!isLive) {
    console.log('⚠️  Você está em TEST mode. Pra afetar vendas reais, troca pra sk_live_...\n')
  } else {
    console.log()
  }

  console.log(`🔍 Procurando promotion code ativo "${PROMOTION_CODE}"...\n`)

  const list = await stripe.promotionCodes.list({
    active: true,
    code: PROMOTION_CODE,
    limit: 10,
  })

  if (list.data.length === 0) {
    console.error(`❌ Promotion code ativo "${PROMOTION_CODE}" não encontrado.`)
    console.error(`   Verifica em https://dashboard.stripe.com/${isLive ? '' : 'test/'}coupons`)
    process.exit(1)
  }

  const oldPromo = list.data[0]
  const couponId = oldPromo.coupon.id

  console.log(`Promotion code atual:`)
  console.log(`  ID: ${oldPromo.id}`)
  console.log(`  Cupom: ${couponId} (${oldPromo.coupon.name || 'sem nome'})`)
  console.log(`  Desconto: ${oldPromo.coupon.amount_off ? `R$ ${(oldPromo.coupon.amount_off / 100).toFixed(2)}` : `${oldPromo.coupon.percent_off}%`}`)
  console.log(`  Redenções atuais: ${oldPromo.times_redeemed}`)
  console.log(`  Expira em: ${oldPromo.expires_at ? new Date(oldPromo.expires_at * 1000).toLocaleString('pt-BR') : 'NUNCA'}`)
  console.log(`  Max redenções: ${oldPromo.max_redemptions ?? 'ilimitado'}`)
  console.log()

  // Se já tá igual ao desejado, sai sem mexer
  const expiresAt = Math.floor(new Date(EXPIRES_AT_DATE).getTime() / 1000)
  if (oldPromo.expires_at === expiresAt && oldPromo.max_redemptions === MAX_REDEMPTIONS) {
    console.log('✅ Já está com a configuração desejada. Nada a fazer.')
    return
  }

  // 1. Desativa o atual
  console.log(`Passo 1/2: Desativando promotion code atual...`)
  await stripe.promotionCodes.update(oldPromo.id, { active: false })
  console.log(`  ✅ ${oldPromo.id} desativado.\n`)

  // 2. Cria novo com expiração + max redemptions
  console.log(`Passo 2/2: Criando novo promotion code com expiração...`)
  const newPromo = await stripe.promotionCodes.create({
    coupon:          couponId,
    code:            PROMOTION_CODE,
    expires_at:      expiresAt,
    max_redemptions: MAX_REDEMPTIONS,
  })

  console.log(`  ✅ Novo: ${newPromo.id}`)
  console.log(`     Código: ${newPromo.code}`)
  console.log(`     Expira em: ${new Date(newPromo.expires_at * 1000).toLocaleString('pt-BR')}`)
  console.log(`     Max redenções: ${newPromo.max_redemptions}`)
  console.log()
  console.log(`💡 Os clientes que já usaram o código antigo não são afetados.`)
  console.log(`   Quem digitar "LANCAMENTO" agora cai no novo (com prazo).`)
}

main().catch((err) => {
  console.error('\n❌ Erro fatal:', err.message)
  if (err.code) console.error(`   Code: ${err.code}`)
  process.exit(1)
})
