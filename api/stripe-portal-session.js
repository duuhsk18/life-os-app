// =============================================================================
// STRIPE PORTAL SESSION — gera URL pro cliente gerenciar a assinatura
// =============================================================================
// O Stripe Customer Portal permite que o usuário sozinho:
//   - Atualize cartão / forma de pagamento
//   - Cancele a assinatura
//   - Veja invoices passadas
//   - Atualize endereço de cobrança
//
// Auth: Bearer token do Supabase (obtido com supabase.auth.getSession())
// Procura customer no Stripe pelo email do user, cria portal session
// e retorna URL pra redirect.
//
// Setup necessário UMA VEZ no Stripe Dashboard:
//   Settings → Billing → Customer portal → ativar + configurar features
// =============================================================================

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
})

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 1. Valida Bearer token do Supabase
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')

  if (!token) {
    return res.status(401).json({ error: 'Missing auth token' })
  }

  const { data: userData, error: userErr } = await supabase.auth.getUser(token)
  if (userErr || !userData?.user) {
    console.warn('[stripe-portal] Auth inválido:', userErr?.message)
    return res.status(401).json({ error: 'Invalid auth token' })
  }

  const email = userData.user.email?.toLowerCase().trim()
  if (!email) {
    return res.status(400).json({ error: 'User has no email' })
  }

  try {
    // 2. Acha o customer no Stripe pelo email
    const customers = await stripe.customers.list({ email, limit: 1 })
    const customer = customers.data[0]

    if (!customer) {
      console.log('[stripe-portal] Sem customer pra', email)
      return res.status(404).json({
        error: 'no_customer',
        message: 'Você ainda não tem nenhuma assinatura ou compra registrada.',
      })
    }

    // 3. Cria portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.SITE_URL}/minha-conta`,
    })

    console.log('[stripe-portal] Portal session criada pra', email)
    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('[stripe-portal] Erro:', err.message)
    // Se Customer Portal não tá configurado, Stripe retorna erro específico
    if (err.message?.includes('No configuration provided')) {
      return res.status(500).json({
        error: 'portal_not_configured',
        message: 'Customer Portal precisa ser ativado no Stripe Dashboard (Settings → Billing → Customer portal).',
      })
    }
    return res.status(500).json({ error: err.message })
  }
}
