// =============================================================================
// CRON: SYNC DE VENDAS KIWIFY VIA API (FALLBACK PRO WEBHOOK)
// =============================================================================
// Roda periodicamente (5-15 min) consultando a API pública do Kiwify.
// Para cada venda paga/reembolsada que não foi processada ainda, replica o
// que o webhook faria: cria usuário + insere/revoga entitlement.
//
// Idempotente: dedup é feito pelo UNIQUE(user_id, product_slug) na tabela.
// Mesmo que o webhook E o cron peguem a mesma venda, nada se duplica.
//
// AUTENTICAÇÃO DO ENDPOINT:
//   - Header `Authorization: Bearer ${CRON_SECRET}`
//   - Vercel Cron envia automaticamente
//   - Cron-job.org (externo) configura no header
// =============================================================================

import { createClient } from '@supabase/supabase-js'
import {
  resolveProductsFromKiwify,
  unwrapKiwifyBody,
} from './_kiwify-products.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const supabasePublic = createClient(
  process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const KIWIFY_API_BASE = 'https://public-api.kiwify.com'
const GRANT_STATUSES  = ['paid', 'approved', 'active']
const REVOKE_STATUSES = ['refunded', 'chargedback', 'cancelled', 'refused']

// Janela de busca: 25h retroativos. Vercel Hobby só permite cron diário, então
// rodamos 1x por dia (06:00 UTC = 03:00 Brasil) e olhamos 25h pra trás
// pra garantir que nada caia no buraco entre runs. Sobreposição é OK
// (UNIQUE constraint deduplica).
const LOOKBACK_MINUTES = 25 * 60

export default async function handler(req, res) {
  // ===== Auth =====
  const authHeader = req.headers.authorization || ''
  const providedSecret = authHeader.replace(/^Bearer\s+/i, '')
  const expectedSecret = process.env.CRON_SECRET

  if (!expectedSecret) {
    console.error('[cron-kiwify] CRON_SECRET não configurado nas env vars')
    return res.status(500).json({ error: 'Missing CRON_SECRET' })
  }

  if (providedSecret !== expectedSecret) {
    console.warn('[cron-kiwify] Tentativa de acesso sem secret válido')
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const startedAt = Date.now()

  try {
    // 1. Token OAuth
    const token = await getKiwifyToken()

    // 2. Busca vendas recentes
    const since = new Date(Date.now() - LOOKBACK_MINUTES * 60 * 1000).toISOString()
    const sales = await fetchKiwifySales(token, since)

    console.log(`[cron-kiwify] ${sales.length} vendas na janela (since=${since})`)

    // 3. Processa cada venda (em sequência, pra logs ficarem ordenados)
    const summary = { processed: 0, granted: 0, revoked: 0, skipped: 0, errors: 0 }
    const details = []

    for (const sale of sales) {
      try {
        const result = await processSale(sale)
        summary.processed++
        summary[result.action] = (summary[result.action] || 0) + 1
        details.push(result)
      } catch (err) {
        console.error('[cron-kiwify] Erro processando venda:', err.message, sale?.order_id)
        summary.errors++
        details.push({ action: 'error', error: err.message, orderId: sale?.order_id })
      }
    }

    const elapsed = Date.now() - startedAt
    console.log(`[cron-kiwify] Concluído em ${elapsed}ms`, summary)

    return res.status(200).json({
      ok:       true,
      since,
      summary,
      details,
      elapsed_ms: elapsed,
    })
  } catch (err) {
    console.error('[cron-kiwify] Erro fatal:', err.message)
    return res.status(500).json({ error: err.message })
  }
}

// ---------------------------------------------------------------------------
// Kiwify API
// ---------------------------------------------------------------------------

/**
 * Pega um access_token via OAuth client_credentials.
 * Token expira em 1h, mas pra simplificar pegamos sempre um novo.
 */
async function getKiwifyToken() {
  const clientId     = process.env.KIWIFY_CLIENT_ID
  const clientSecret = process.env.KIWIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('KIWIFY_CLIENT_ID ou KIWIFY_CLIENT_SECRET não configurados')
  }

  const res = await fetch(`${KIWIFY_API_BASE}/v1/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id:     clientId,
      client_secret: clientSecret,
      grant_type:    'client_credentials',
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OAuth Kiwify falhou (${res.status}): ${text}`)
  }

  const data = await res.json()
  if (!data.access_token) {
    throw new Error('OAuth Kiwify não retornou access_token')
  }
  return data.access_token
}

/**
 * Lista vendas a partir de uma data. Tenta 2 endpoints conhecidos
 * (Kiwify mudou a URL ao longo do tempo; deixa robusto).
 */
async function fetchKiwifySales(token, sinceIso) {
  const accountId = process.env.KIWIFY_ACCOUNT_ID

  // Endpoint principal (atual)
  const url = new URL(`${KIWIFY_API_BASE}/v1/sales`)
  url.searchParams.set('start_date', sinceIso)
  url.searchParams.set('per_page',   '100')
  if (accountId) url.searchParams.set('account_id', accountId)

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type':  'application/json',
  }
  if (accountId) headers['x-kiwify-account-id'] = accountId

  const res = await fetch(url.toString(), { headers })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Sales API falhou (${res.status}): ${text}`)
  }

  const data = await res.json()
  // Kiwify retorna { data: [...] } ou { sales: [...] } dependendo da versão
  return data.data || data.sales || data.results || []
}

// ---------------------------------------------------------------------------
// Sale processing (mesma lógica do webhook)
// ---------------------------------------------------------------------------

async function processSale(rawSale) {
  // Desempacota se vier envelopado em { order: {...} }
  const sale = unwrapKiwifyBody(rawSale)

  const status      = sale?.order_status || sale?.status
  const email       = (sale?.Customer?.email || sale?.customer?.email)?.toLowerCase().trim()
  const name        = sale?.Customer?.full_name || sale?.Customer?.name
                     || sale?.customer?.full_name || sale?.customer?.name
                     || 'Membro'
  const orderId     = sale?.order_id || sale?.id
  const productId   = sale?.checkout_link
                     || sale?.Product?.checkout_link
                     || sale?.product?.checkout_link
                     || sale?.Product?.product_id
                     || sale?.product?.product_id
                     || sale?.product_id
  const productName = sale?.Product?.product_name || sale?.product?.product_name

  if (!email) {
    return { action: 'skipped', reason: 'sem email', orderId }
  }

  const slugs = resolveProductsFromKiwify(productId, productName)
  if (slugs.length === 0) {
    return { action: 'skipped', reason: 'produto não mapeado', productId, productName, orderId }
  }

  // ===== GRANT =====
  if (GRANT_STATUSES.includes(status)) {
    const userId = await ensureUser({ email, name })
    if (!userId) {
      return { action: 'skipped', reason: 'falha criar usuário', email, orderId }
    }

    const rows = slugs.map((slug) => ({
      user_id:         userId,
      product_slug:    slug,
      source:          'cron-kiwify',
      kiwify_order_id: orderId,
      active:          true,
    }))

    const { error: insErr } = await supabase
      .from('lifeos_user_products')
      .upsert(rows, { onConflict: 'user_id,product_slug', ignoreDuplicates: false })

    if (insErr) {
      throw new Error(`Erro upsert entitlements: ${insErr.message}`)
    }

    // Se for primeira vez (usuário acabou de ser criado), envia magic link
    await sendMagicLinkIfNew({ email, name })

    return { action: 'granted', email, slugs, orderId }
  }

  // ===== REVOKE =====
  if (REVOKE_STATUSES.includes(status)) {
    const userId = await findUserByEmail(email)
    if (!userId) {
      return { action: 'skipped', reason: 'usuário não existe pra revogar', email, orderId }
    }

    const { error: updErr } = await supabase
      .from('lifeos_user_products')
      .update({ active: false })
      .eq('user_id', userId)
      .in('product_slug', slugs)

    if (updErr) {
      throw new Error(`Erro revogar: ${updErr.message}`)
    }

    return { action: 'revoked', email, slugs, orderId }
  }

  return { action: 'skipped', reason: `status sem ação: ${status}`, orderId }
}

// ---------------------------------------------------------------------------
// User helpers (idênticos ao webhook)
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

  if (createError) throw createError
  return null
}

async function findUserByEmail(email) {
  const { data: list, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) return null
  const user = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())
  return user?.id || null
}

async function sendMagicLinkIfNew({ email, name }) {
  const { error } = await supabasePublic.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo:  `${process.env.SITE_URL}/minha-conta`,
      data:             { full_name: name },
    },
  })

  if (error) {
    console.warn('[cron-kiwify] signInWithOtp falhou:', error.message)
  } else {
    console.log('[cron-kiwify] Magic link enviado pra', email)
  }
}
