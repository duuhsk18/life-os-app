// =============================================================================
// STRIPE WEBHOOK — grant/revoke entitlements baseado em events do Stripe
// =============================================================================
// Eventos tratados:
//   - checkout.session.completed     → grant (novas compras + 1ª parcela de sub)
//   - charge.refunded                → revoke (reembolsos)
//   - customer.subscription.deleted  → revoke (cancelamento de Life OS)
//
// Auth: signature do header 'stripe-signature' validada com stripe.webhooks
// (SDK oficial), MUITO mais robusto que HMAC manual.
//
// O fluxo de grant/revoke é o mesmo do kiwify-webhook (ensureUser, upsert
// entitlement, sendMagicLinkEmail) — só muda o que vem do payload.
// =============================================================================

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import {
  expandInternalSlug,
  extractStripeInternalSlug,
  extractStripeEmail,
  extractStripeName,
} from './_stripe-products.js'
import { sendMagicLinkEmail } from './_email.js'

// Stripe webhook precisa de raw body pra validar assinatura
export const config = {
  api: { bodyParser: false },
}

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

  // 1. Lê raw body pra validação de signature
  let rawBody
  try {
    rawBody = await readRawBody(req)
  } catch (err) {
    console.error('[stripe] Erro lendo raw body:', err.message)
    return res.status(400).json({ error: 'Bad request' })
  }

  // 2. Valida signature
  const signature = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    console.error('[stripe] Faltando stripe-signature header ou STRIPE_WEBHOOK_SECRET env var')
    return res.status(400).json({ error: 'Missing signature config' })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.warn('[stripe] Signature inválida:', err.message)
    return res.status(401).json({ error: 'Invalid signature' })
  }

  console.log(`[stripe] Evento recebido: ${event.type} (id=${event.id})`)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        return await handleCheckoutCompleted(event.data.object, res)

      case 'charge.refunded':
        return await handleChargeRefunded(event.data.object, res)

      case 'customer.subscription.deleted':
        return await handleSubscriptionDeleted(event.data.object, res)

      default:
        console.log(`[stripe] Evento ignorado: ${event.type}`)
        return res.status(200).json({ ok: true, action: 'ignored', type: event.type })
    }
  } catch (err) {
    console.error('[stripe] ❌ Erro processando evento:', err.message)
    return res.status(500).json({ error: err.message })
  }
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handleCheckoutCompleted(session, res) {
  const internalSlug = extractStripeInternalSlug(session)
  const email        = extractStripeEmail(session)?.toLowerCase().trim()
  const name         = extractStripeName(session)
  const slugs        = expandInternalSlug(internalSlug)

  console.log('[stripe] checkout.session.completed', {
    sessionId:    session.id,
    email,
    internalSlug,
    slugs,
    paymentStatus: session.payment_status,
  })

  if (!email) {
    console.warn('[stripe] Sessão sem email — pulando')
    return res.status(200).json({ ok: true, action: 'noop_no_email' })
  }

  if (slugs.length === 0) {
    console.warn('[stripe] Sessão sem internal_slug — pulando. Verifique se o Payment Link tem metadata.internal_slug.')
    return res.status(200).json({ ok: true, action: 'noop_no_slug', sessionId: session.id })
  }

  // Pagamentos pendentes (boleto/PIX): só conceder quando paid
  if (session.payment_status === 'unpaid') {
    return res.status(200).json({ ok: true, action: 'awaiting_payment', sessionId: session.id })
  }

  const userId = await ensureUser({ email, name })
  if (!userId) throw new Error('Não foi possível criar/encontrar usuário')

  const rows = slugs.map((slug) => ({
    user_id:           userId,
    product_slug:      slug,
    source:            'stripe',
    kiwify_order_id:   session.id, // Reusamos a coluna pra qualquer order_id externo
    active:            true,
  }))

  const { error: insErr } = await supabase
    .from('lifeos_user_products')
    .upsert(rows, { onConflict: 'user_id,product_slug', ignoreDuplicates: false })

  if (insErr) {
    console.error('[stripe] Erro ao inserir entitlements:', insErr.message)
    throw insErr
  }
  console.log('[stripe] ✅ Entitlements concedidos:', email, slugs.join(', '))

  await sendMagicLinkEmail({ supabase, email, name, logPrefix: '[stripe]' })

  return res.status(200).json({
    ok:      true,
    action:  'access_granted',
    email,
    granted: slugs,
  })
}

async function handleChargeRefunded(charge, res) {
  // Charge → tenta achar a session pelo payment_intent
  const paymentIntentId = charge.payment_intent
  if (!paymentIntentId) {
    return res.status(200).json({ ok: true, action: 'noop_no_intent' })
  }

  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntentId,
    limit: 1,
  })
  const session = sessions.data[0]

  if (!session) {
    console.warn('[stripe] Refund sem session — payment_intent:', paymentIntentId)
    return res.status(200).json({ ok: true, action: 'noop_no_session' })
  }

  const email = extractStripeEmail(session)?.toLowerCase().trim()
  const slugs = expandInternalSlug(extractStripeInternalSlug(session))

  console.log('[stripe] charge.refunded', { sessionId: session.id, email, slugs, refundedAmount: charge.amount_refunded })

  return await revokeEntitlements({ email, slugs, externalId: session.id, logPrefix: '[stripe-refund]', res })
}

async function handleSubscriptionDeleted(subscription, res) {
  // Sub deletada — revoga os slugs associados
  const internalSlug = subscription.metadata?.internal_slug
  const slugs        = expandInternalSlug(internalSlug)

  // Email vem do customer
  const customer = await stripe.customers.retrieve(subscription.customer)
  const email    = customer.email?.toLowerCase().trim()

  console.log('[stripe] subscription.deleted', { subId: subscription.id, email, internalSlug, slugs })

  return await revokeEntitlements({ email, slugs, externalId: subscription.id, logPrefix: '[stripe-sub]', res })
}

// ---------------------------------------------------------------------------
// Shared revoke logic
// ---------------------------------------------------------------------------

async function revokeEntitlements({ email, slugs, externalId, logPrefix, res }) {
  if (!email) {
    console.warn(`${logPrefix} Sem email — pulando revoke`)
    return res.status(200).json({ ok: true, action: 'noop_no_email' })
  }

  const userId = await findUserByEmail(email)
  if (!userId) {
    console.warn(`${logPrefix} Usuário ${email} não encontrado — pulando revoke`)
    return res.status(200).json({ ok: true, action: 'noop_user_not_found', email })
  }

  // Estratégia 1: revoga por slug
  let revokedCount = 0
  if (slugs.length > 0) {
    const { data, error } = await supabase
      .from('lifeos_user_products')
      .update({ active: false })
      .eq('user_id', userId)
      .in('product_slug', slugs)
      .eq('active', true)
      .select()

    if (error) throw error
    revokedCount = data?.length || 0
    if (revokedCount > 0) {
      console.log(`${logPrefix} ⛔ Revogado por slug:`, email, slugs.join(', '), `(${revokedCount} linhas)`)
    }
  }

  // Estratégia 2: fallback por external_id (session.id ou sub.id)
  if (revokedCount === 0 && externalId) {
    const { data, error } = await supabase
      .from('lifeos_user_products')
      .update({ active: false })
      .eq('user_id', userId)
      .eq('kiwify_order_id', externalId)
      .eq('active', true)
      .select()

    if (error) throw error
    revokedCount = data?.length || 0
    if (revokedCount > 0) {
      console.log(`${logPrefix} ⛔ Revogado por external_id (fallback):`, email, externalId, `(${revokedCount} linhas)`)
    }
  }

  if (revokedCount === 0) {
    console.warn(`${logPrefix} ⚠ 0 linhas afetadas pra ${email} | slugs: ${slugs} | externalId: ${externalId}`)
    return res.status(200).json({ ok: true, action: 'noop_nothing_to_revoke', email, slugs, externalId })
  }

  return res.status(200).json({ ok: true, action: 'access_revoked', email, revokedCount })
}

// ---------------------------------------------------------------------------
// Helpers (compartilhados com kiwify-webhook)
// ---------------------------------------------------------------------------

async function readRawBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

async function ensureUser({ email, name }) {
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: name },
  })

  if (created?.user?.id) return created.user.id

  if (createError?.message?.toLowerCase().includes('already')) {
    return findUserByEmail(email)
  }

  if (createError) {
    console.error('[stripe] createUser:', createError.message)
    throw createError
  }
  return null
}

async function findUserByEmail(email) {
  const { data: list, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) {
    console.error('[stripe] listUsers:', error.message)
    return null
  }
  const user = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())
  return user?.id || null
}
