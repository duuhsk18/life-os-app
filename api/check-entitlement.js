// =============================================================================
// CHECK ENTITLEMENT — valida se user logado tem acesso a um produto
// =============================================================================
// Usado pelo auth-gate.js dentro dos entregáveis pra confirmar:
//   1. Token Supabase é válido
//   2. User tem entitlement ativo pro slug solicitado (ou retorna lista geral)
//
// Auth: Bearer token do Supabase (lido do localStorage no front-end)
// =============================================================================

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // CORS — gate.js chama de URL própria, mas previne 404 em casos exóticos
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ error: 'no_token' })

  // 1. Valida JWT do Supabase
  const { data: userData, error: userErr } = await supabase.auth.getUser(token)
  if (userErr || !userData?.user) {
    return res.status(401).json({ error: 'invalid_token' })
  }

  // 2. Lista entitlements ativos do user
  const { data, error: dbErr } = await supabase
    .from('lifeos_user_products')
    .select('product_slug')
    .eq('user_id', userData.user.id)
    .eq('active', true)

  if (dbErr) {
    console.error('[check-entitlement] db error:', dbErr.message)
    return res.status(500).json({ error: dbErr.message })
  }

  return res.status(200).json({
    slugs: (data || []).map((r) => r.product_slug),
    email: userData.user.email,
    user_id: userData.user.id,
  })
}
