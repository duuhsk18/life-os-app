import { createClient } from '@supabase/supabase-js'
import {
  resolveProductsFromKiwify,
  extractKiwifyProductId,
} from './_kiwify-products.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Eventos Kiwify
const GRANT_EVENTS  = ['paid', 'approved', 'active']
const REVOKE_EVENTS = ['refunded', 'chargedback', 'cancelled']

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Validação da assinatura (?signature=)
  const signature = req.query.signature
  if (!signature || signature !== process.env.KIWIFY_SECRET) {
    console.warn('[kiwify] Assinatura inválida:', signature)
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const body   = req.body
  const status = body?.order_status

  const email = body?.customer?.email?.toLowerCase().trim()
  const name  = body?.customer?.name || 'Membro'
  const orderId = body?.order_id || body?.Order?.order_id || null

  if (!email) {
    return res.status(400).json({ error: 'E-mail não encontrado no payload' })
  }

  const kiwifyProductId = extractKiwifyProductId(body)
  const slugsToGrant    = resolveProductsFromKiwify(kiwifyProductId)

  console.log('[kiwify]', {
    status,
    email,
    kiwifyProductId,
    slugs: slugsToGrant,
    orderId,
  })

  // ===== GRANT (compra aprovada) =====
  if (GRANT_EVENTS.includes(status)) {
    if (slugsToGrant.length === 0) {
      console.warn('[kiwify] product_id desconhecido — nenhum slug mapeado:', kiwifyProductId)
      // Continua e cria conta mesmo assim (pra não bloquear), mas sem entitlements
    }

    try {
      // 1. Garante que o usuário existe
      const userId = await ensureUser({ email, name })
      if (!userId) throw new Error('Não foi possível criar/encontrar usuário')

      // 2. Insere os entitlements (idempotente via UNIQUE)
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

      // 3. Envia magic link de acesso
      await sendMagicLink({ email, name })

      return res.status(200).json({
        ok:     true,
        action: 'access_granted',
        email,
        granted: slugsToGrant,
      })
    } catch (err) {
      console.error('[kiwify] ❌ Erro:', err.message)
      return res.status(500).json({ error: err.message })
    }
  }

  // ===== REVOKE (reembolso / chargeback / cancelamento) =====
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
          console.error('[kiwify] Erro ao revogar entitlement:', updErr.message)
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

  // Outros eventos (boleto gerado, carrinho abandonado, etc.) — ignora
  return res.status(200).json({ ok: true, action: 'ignored', status })
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Cria o usuário se não existir e retorna o user_id. Idempotente. */
async function ensureUser({ email, name }) {
  // Primeiro tenta criar
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: name },
  })

  if (created?.user?.id) return created.user.id

  // Se já existe, busca o ID
  if (createError?.message?.toLowerCase().includes('already')) {
    return findUserByEmail(email)
  }

  if (createError) {
    console.error('[kiwify] createUser:', createError.message)
    throw createError
  }

  return null
}

/** Busca o user_id pelo e-mail (auth.users). */
async function findUserByEmail(email) {
  const { data: list, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) {
    console.error('[kiwify] listUsers:', error.message)
    return null
  }
  const user = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())
  return user?.id || null
}

/** Envia magic link / convite com redirect para /minha-conta. */
async function sendMagicLink({ email, name }) {
  const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    data:       { full_name: name },
    redirectTo: `${process.env.SITE_URL}/minha-conta`,
  })

  if (inviteError && !inviteError.message?.toLowerCase().includes('already')) {
    console.warn('[kiwify] inviteUserByEmail:', inviteError.message)
  }
}
