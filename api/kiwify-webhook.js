import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import {
  resolveProductsFromKiwify,
  extractKiwifyProductId,
  extractKiwifyProductName,
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
  // Pega o que parece HMAC válido (40 chars hex) ou o último.
  let signature = req.query.signature
  if (Array.isArray(signature)) {
    signature = signature.find((s) => /^[a-f0-9]{40}$/i.test(s)) || signature[signature.length - 1]
  }
  const token = process.env.KIWIFY_TOKEN || process.env.KIWIFY_SECRET // fallback

  if (!token) {
    console.error('[kiwify] KIWIFY_TOKEN não configurado nas env vars')
    return res.status(500).json({ error: 'Missing KIWIFY_TOKEN' })
  }

  const expected = crypto.createHmac('sha1', token).update(rawBody).digest('hex')

  if (signature !== expected) {
    console.warn('[kiwify] HMAC inválido', {
      received: signature,
      expectedLen: expected.length,
    })
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // 3. Faz parse do body como JSON
  let body
  try {
    body = JSON.parse(rawBody)
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  const status   = body?.order_status
  const email    = body?.Customer?.email?.toLowerCase().trim()
                  || body?.customer?.email?.toLowerCase().trim()
  const name     = body?.Customer?.full_name
                  || body?.Customer?.name
                  || body?.customer?.name
                  || 'Membro'
  const orderId  = body?.order_id || body?.Order?.order_id || null

  // Test webhook do Kiwify usa email "test@kiwify.com.br" — responde 200 sem fazer nada
  if (!email || email === 'test@kiwify.com.br') {
    console.log('[kiwify] Test webhook recebido — assinatura OK')
    return res.status(200).json({ ok: true, action: 'test_received' })
  }

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
