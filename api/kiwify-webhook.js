import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import {
  resolveProductsFromKiwify,
  extractKiwifyProductId,
  extractKiwifyProductName,
  extractKiwifyEmail,
  extractKiwifyName,
  extractKiwifyStatus,
  extractKiwifyOrderId,
  unwrapKiwifyBody,
} from './_kiwify-products.js'

// Desabilita bodyParser do Vercel — precisamos do raw body pra calcular o HMAC
export const config = {
  api: { bodyParser: false },
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const GRANT_EVENTS  = ['paid', 'approved', 'active']
const REVOKE_EVENTS = ['refunded', 'chargedback', 'cancelled']
const TEST_EMAILS   = ['test@kiwify.com.br', 'johndoe@example.com']

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 1. Lê o raw body
  let rawBody
  try {
    rawBody = await readRawBody(req)
  } catch (err) {
    console.error('[kiwify] Erro lendo raw body:', err.message)
    return res.status(400).json({ error: 'Bad request' })
  }

  // 2. Valida HMAC-SHA1 (signature do Kiwify)
  // O Kiwify envia: ?signature=hmac_sha1_hex(rawBody, TOKEN)
  // O TOKEN é exibido na página de Webhooks no painel Kiwify
  // Se a URL já tinha ?signature=X, Kiwify anexa &signature=hmac → vira array.
  let signature = req.query.signature
  if (Array.isArray(signature)) {
    signature = signature.find((s) => /^[a-f0-9]{40}$/i.test(s)) || signature[signature.length - 1]
  }
  const token = process.env.KIWIFY_TOKEN || process.env.KIWIFY_SECRET

  if (!token) {
    console.error('[kiwify] KIWIFY_TOKEN não configurado nas env vars')
    return res.status(500).json({ error: 'Missing KIWIFY_TOKEN' })
  }

  // 3. Parse do body ANTES da validação HMAC — Kiwify computa HMAC sobre
  //    JSON.stringify(parsed), não sobre o raw body. Documentação:
  //    signature = hmac_sha1(JSON.stringify(request.body), secretKey)
  let body
  try {
    body = JSON.parse(rawBody)
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  // 4. Valida HMAC tentando 3 formas (Kiwify usa diferentes representações
  //    dependendo do contexto: webhook direto vs reenvio do dashboard)
  const hmacFromRaw    = crypto.createHmac('sha1', token).update(rawBody).digest('hex')
  const hmacFromBody   = crypto.createHmac('sha1', token).update(JSON.stringify(body)).digest('hex')
  const innerOrder     = body?.order || body?.Order
  const hmacFromInner  = innerOrder
    ? crypto.createHmac('sha1', token).update(JSON.stringify(innerOrder)).digest('hex')
    : null

  const valid = signature === hmacFromRaw
             || signature === hmacFromBody
             || signature === hmacFromInner

  if (!valid) {
    console.warn('[kiwify] HMAC inválido', {
      received: signature,
      tried: {
        raw:   hmacFromRaw,
        body:  hmacFromBody,
        inner: hmacFromInner,
      },
      bodyLen: rawBody.length,
    })
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Loga qual método validou (útil pra entender qual formato Kiwify usa)
  const matchedMethod = signature === hmacFromRaw ? 'raw'
                       : signature === hmacFromBody ? 'body-stringify'
                       : 'inner-order-stringify'
  console.log(`[kiwify] HMAC válido via ${matchedMethod}`)

  // 4. Extrai dados do payload (suporta tanto envelope { order: {...} } quanto root)
  const status            = extractKiwifyStatus(body)
  const email             = extractKiwifyEmail(body)?.toLowerCase().trim()
  const name              = extractKiwifyName(body)
  const orderId           = extractKiwifyOrderId(body)
  const kiwifyProductId   = extractKiwifyProductId(body)
  const kiwifyProductName = extractKiwifyProductName(body)
  const slugsToGrant      = resolveProductsFromKiwify(kiwifyProductId, kiwifyProductName)

  console.log('[kiwify]', {
    status,
    email,
    kiwifyProductId,
    kiwifyProductName,
    slugs: slugsToGrant,
    orderId,
  })

  // Test webhook do Kiwify usa emails de teste — responde 200 sem fazer nada
  if (!email || TEST_EMAILS.includes(email)) {
    console.log('[kiwify] Test webhook ou e-mail ausente — assinatura OK, ignorando')
    return res.status(200).json({ ok: true, action: 'test_received' })
  }

  if (slugsToGrant.length === 0 && GRANT_EVENTS.includes(status)) {
    console.warn('[kiwify] PAYLOAD NÃO MAPEADO — payload completo:', JSON.stringify(body, null, 2))
  }

  // ===== GRANT =====
  if (GRANT_EVENTS.includes(status)) {
    try {
      const userId = await ensureUser({ email, name })
      if (!userId) throw new Error('Não foi possível criar/encontrar usuário')

      if (slugsToGrant.length > 0) {
        const rows = slugsToGrant.map((slug) => ({
          user_id:         userId,
          product_slug:    slug,
          source:          'kiwify',
          kiwify_order_id: orderId,
          active:          true,
        }))

        const { error: insErr } = await supabase
          .from('lifeos_user_products')
          .upsert(rows, { onConflict: 'user_id,product_slug', ignoreDuplicates: false })

        if (insErr) {
          console.error('[kiwify] Erro ao inserir entitlements:', insErr.message)
        } else {
          console.log('[kiwify] ✅ Entitlements concedidos:', slugsToGrant.join(', '))
        }
      }

      await sendMagicLink({ email, name })

      return res.status(200).json({
        ok:      true,
        action:  'access_granted',
        email,
        granted: slugsToGrant,
      })
    } catch (err) {
      console.error('[kiwify] ❌ Erro:', err.message)
      return res.status(500).json({ error: err.message })
    }
  }

  // ===== REVOKE =====
  if (REVOKE_EVENTS.includes(status)) {
    try {
      const userId = await findUserByEmail(email)
      if (userId && slugsToGrant.length > 0) {
        const { error: updErr } = await supabase
          .from('lifeos_user_products')
          .update({ active: false })
          .eq('user_id', userId)
          .in('product_slug', slugsToGrant)

        if (updErr) {
          console.error('[kiwify] Erro ao revogar:', updErr.message)
        } else {
          console.log('[kiwify] ⛔ Acesso revogado:', email, slugsToGrant.join(', '))
        }
      }

      return res.status(200).json({
        ok:      true,
        action:  'access_revoked',
        email,
        revoked: slugsToGrant,
      })
    } catch (err) {
      console.error('[kiwify] Erro ao revogar:', err.message)
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(200).json({ ok: true, action: 'ignored', status })
}

// ---------------------------------------------------------------------------
// Helpers
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
    console.error('[kiwify] createUser:', createError.message)
    throw createError
  }

  return null
}

async function findUserByEmail(email) {
  const { data: list, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) {
    console.error('[kiwify] listUsers:', error.message)
    return null
  }
  const user = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())
  return user?.id || null
}

async function sendMagicLink({ email, name }) {
  const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    data:       { full_name: name },
    redirectTo: `${process.env.SITE_URL}/minha-conta`,
  })

  if (inviteError && !inviteError.message?.toLowerCase().includes('already')) {
    console.warn('[kiwify] inviteUserByEmail:', inviteError.message)
  }
}
