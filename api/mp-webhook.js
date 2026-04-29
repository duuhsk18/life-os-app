// =============================================================================
// MP WEBHOOK — recebe notificações de pagamento do Mercado Pago
// =============================================================================
// MP envia POST quando status de pagamento muda. A gente busca os detalhes
// do pagamento via API, valida o status, e libera os entitlements do user.
//
// Formato da notificação MP:
//   { type: 'payment', action: 'payment.updated', data: { id: '12345' } }
//
// Validação de signature (opcional mas recomendada): MP envia x-signature header
// e x-request-id. Validamos com MP_WEBHOOK_SECRET configurado no dashboard.
// Se MP_WEBHOOK_SECRET não setado, pulamos validação (dev mode).
// =============================================================================

import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { sendMagicLinkEmail } from './_email.js'
import { sendPurchaseEvent } from './_meta-capi.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const KIT_COMPLETO_SLUGS = [
  'receitas-low-carb', 'planilhas-treino', 'receitas-indigenas',
  'templates-notion', 'ebooks-autoajuda', 'planilhas-financeiras',
]

function expandSlug(slug) {
  if (slug === 'kit-completo' || slug === '__KIT_COMPLETO__') return KIT_COMPLETO_SLUGS
  return [slug]
}

/**
 * Valida assinatura MP. Spec:
 *   x-signature: ts=1234567890,v1=hash_value
 *   x-request-id: uuid
 *
 *   Manifest a ser hashado: id:[id_pagamento];request-id:[req_id];ts:[ts];
 *   Hash: HMAC-SHA256(manifest, MP_WEBHOOK_SECRET)
 *
 *   Compara com v1 do x-signature.
 */
function verifyMpSignature(req, paymentId) {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true // sem secret configurado, skip (dev)

  const signature = req.headers['x-signature']
  const requestId = req.headers['x-request-id']
  if (!signature || !requestId) return false

  // Parse signature: "ts=NNN,v1=HASH"
  const parts = signature.split(',').reduce((acc, p) => {
    const [k, v] = p.trim().split('=')
    if (k && v) acc[k] = v
    return acc
  }, {})

  if (!parts.ts || !parts.v1) return false

  const manifest = `id:${paymentId};request-id:${requestId};ts:${parts.ts};`
  const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

  return hmac === parts.v1
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.MP_ACCESS_TOKEN) {
    console.error('[mp-webhook] MP_ACCESS_TOKEN não configurado')
    return res.status(500).json({ error: 'mp_not_configured' })
  }

  // MP manda POST sem body em alguns casos (apenas query params).
  // Outras vezes manda body { action, data: { id } }
  const action  = req.body?.action || req.query?.action
  const dataId  = req.body?.data?.id || req.query?.['data.id']
  const topic   = req.body?.type || req.query?.type || req.query?.topic

  // Filtra pra só eventos de pagamento (ignora merchant_order, etc)
  if (topic !== 'payment' && !action?.startsWith('payment.')) {
    console.log('[mp-webhook] evento ignorado:', { topic, action })
    return res.status(200).json({ ok: true, ignored: true })
  }

  const paymentId = dataId
  if (!paymentId) {
    console.warn('[mp-webhook] sem ID de pagamento')
    return res.status(400).json({ error: 'no_payment_id' })
  }

  // Valida signature (se configurada)
  if (!verifyMpSignature(req, paymentId)) {
    console.warn('[mp-webhook] signature inválida')
    return res.status(401).json({ error: 'invalid_signature' })
  }

  try {
    // Busca detalhes do pagamento na API do MP
    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    })
    if (!paymentRes.ok) {
      const errText = await paymentRes.text().catch(() => '')
      console.error('[mp-webhook] erro buscando pagamento:', paymentRes.status, errText)
      return res.status(500).json({ error: 'mp_fetch_failed' })
    }
    const payment = await paymentRes.json()

    console.log('[mp-webhook] pagamento recebido:', {
      id: payment.id,
      status: payment.status,
      external_reference: payment.external_reference,
      amount: payment.transaction_amount,
    })

    // Só processa se aprovado
    if (payment.status !== 'approved') {
      return res.status(200).json({ ok: true, action: 'awaiting_approval', status: payment.status })
    }

    // Parse external_reference (JSON com slugs + email)
    let ref = {}
    try { ref = JSON.parse(payment.external_reference || '{}') } catch {}

    const slugs = (ref.slugs || []).filter(Boolean)
    if (slugs.length === 0) {
      console.warn('[mp-webhook] external_reference sem slugs:', payment.external_reference)
      return res.status(200).json({ ok: true, action: 'no_slugs' })
    }

    // Email vem do payer ou do external_reference
    const email = (payment.payer?.email || ref.email || '').toLowerCase().trim()
    if (!email) {
      console.warn('[mp-webhook] sem email no pagamento')
      return res.status(200).json({ ok: true, action: 'no_email' })
    }

    const name = payment.payer?.first_name
      ? `${payment.payer.first_name} ${payment.payer.last_name || ''}`.trim()
      : email.split('@')[0]

    // Expande slugs (kit-completo → 6)
    const expandedSlugs = [...new Set(slugs.flatMap(expandSlug))]

    // 1. Garante user no Supabase
    const userId = await ensureUser({ email, name })
    if (!userId) throw new Error('Não foi possível criar/encontrar usuário')

    // 2. Garante profile (FK)
    await ensureProfile(userId, email, name)

    // 3. Insere entitlements
    const rows = expandedSlugs.map((slug) => ({
      user_id:         userId,
      product_slug:    slug,
      source:          'mercado_pago',
      kiwify_order_id: String(payment.id), // reusamos a coluna pra qualquer ID externo
      active:          true,
    }))

    const { error: insErr } = await supabase
      .from('lifeos_user_products')
      .upsert(rows, { onConflict: 'user_id,product_slug', ignoreDuplicates: false })

    if (insErr) {
      console.error('[mp-webhook] erro inserindo entitlements:', insErr.message)
      throw insErr
    }
    console.log('[mp-webhook] ✅ Entitlements concedidos:', email, expandedSlugs.join(', '))

    // 4. Magic link branded via Resend
    await sendMagicLinkEmail({ supabase, email, name, logPrefix: '[mp]' })

    // 5. Meta CAPI Purchase event
    await sendPurchaseEvent({
      email,
      value:       payment.transaction_amount || 0,
      currency:    (payment.currency_id || 'BRL').toUpperCase(),
      eventId:     `mp_${payment.id}`,
      contentIds:  expandedSlugs,
    }).catch((e) => console.warn('[mp→capi]', e.message))

    return res.status(200).json({
      ok:      true,
      action:  'access_granted',
      email,
      granted: expandedSlugs,
    })
  } catch (err) {
    console.error('[mp-webhook] ❌ erro:', err.message)
    return res.status(500).json({ error: err.message })
  }
}

// ---------------------------------------------------------------------------
// Helpers (mesmos do stripe-webhook)
// ---------------------------------------------------------------------------

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
    console.error('[mp-webhook] createUser:', createError.message)
    throw createError
  }
  return null
}

async function findUserByEmail(email) {
  const { data: list, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) return null
  const user = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())
  return user?.id || null
}

async function ensureProfile(userId, email, name) {
  const { error } = await supabase
    .from('lifeos_profiles')
    .upsert({
      id:        userId,
      email,
      full_name: name || email?.split('@')[0] || 'Membro',
    }, { onConflict: 'id', ignoreDuplicates: true })
  if (error) {
    console.error('[mp-webhook] ensureProfile:', error.message)
    throw error
  }
}
