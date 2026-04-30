// =============================================================================
// ADMIN STATS — métricas em tempo real pra o dashboard /admin
// =============================================================================
// Protegido por ADMIN_EMAIL. Só o owner consegue acessar.
//
// GET /api/admin-stats?email=duuharts01@gmail.com
// Returns: { sales: {...}, products: [...], recentOrders: [...] }
// =============================================================================

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ADMIN_EMAILS = ['duuharts01@gmail.com', 'magonfotografia@gmail.com']

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const email = (req.query?.email || '').toLowerCase().trim()
  if (!ADMIN_EMAILS.includes(email)) {
    return res.status(403).json({ error: 'forbidden' })
  }

  try {
    // 1. Total de entitlements (vendas únicas)
    const { count: totalEntitlements } = await supabase
      .from('lifeos_user_products')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)

    // 2. Vendas hoje (últimas 24h)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: todayCount } = await supabase
      .from('lifeos_user_products')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)
      .gte('created_at', yesterday)

    // 3. Vendas últimos 7 dias
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: weekCount } = await supabase
      .from('lifeos_user_products')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)
      .gte('created_at', lastWeek)

    // 4. Vendas últimos 30 dias
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { count: monthCount } = await supabase
      .from('lifeos_user_products')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)
      .gte('created_at', lastMonth)

    // 5. Top produtos (do mês)
    const { data: monthProducts } = await supabase
      .from('lifeos_user_products')
      .select('product_slug')
      .eq('active', true)
      .gte('created_at', lastMonth)

    const productCounts = {}
    for (const row of monthProducts || []) {
      productCounts[row.product_slug] = (productCounts[row.product_slug] || 0) + 1
    }
    const topProducts = Object.entries(productCounts)
      .map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    // 6. Distribuição por source
    const { data: sourceDist } = await supabase
      .from('lifeos_user_products')
      .select('source')
      .eq('active', true)
      .gte('created_at', lastMonth)

    const sourceCounts = {}
    for (const row of sourceDist || []) {
      sourceCounts[row.source || 'unknown'] = (sourceCounts[row.source || 'unknown'] || 0) + 1
    }

    // 7. Últimos 10 pedidos
    const { data: recentOrders } = await supabase
      .from('lifeos_user_products')
      .select(`product_slug, source, kiwify_order_id, created_at, user_id`)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(10)

    // 8. Pega emails dos últimos pedidos
    if (recentOrders && recentOrders.length > 0) {
      const userIds = [...new Set(recentOrders.map((o) => o.user_id))]
      const { data: profiles } = await supabase
        .from('lifeos_profiles')
        .select('id, email')
        .in('id', userIds)

      const emailById = {}
      for (const p of profiles || []) emailById[p.id] = p.email

      for (const o of recentOrders) {
        o.email = emailById[o.user_id] || null
      }
    }

    // 9. Total de usuários únicos
    const { count: totalUsers } = await supabase
      .from('lifeos_profiles')
      .select('*', { count: 'exact', head: true })

    // 10. Vendas por dia últimos 30 dias (pra gráfico)
    const dailyCounts = {}
    for (let i = 0; i < 30; i++) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().slice(0, 10)
      dailyCounts[key] = 0
    }
    const { data: allMonth } = await supabase
      .from('lifeos_user_products')
      .select('created_at')
      .eq('active', true)
      .gte('created_at', lastMonth)
    for (const row of allMonth || []) {
      const key = row.created_at.slice(0, 10)
      if (dailyCounts[key] !== undefined) dailyCounts[key]++
    }
    const dailySeries = Object.entries(dailyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))

    return res.status(200).json({
      ok:           true,
      generatedAt:  new Date().toISOString(),
      totals: {
        entitlements: totalEntitlements || 0,
        users:        totalUsers || 0,
      },
      windowed: {
        today: todayCount || 0,
        week:  weekCount  || 0,
        month: monthCount || 0,
      },
      topProducts,
      sources:      sourceCounts,
      dailySeries,
      recentOrders: recentOrders || [],
    })
  } catch (err) {
    console.error('[admin-stats]', err.message)
    return res.status(500).json({ error: err.message })
  }
}
